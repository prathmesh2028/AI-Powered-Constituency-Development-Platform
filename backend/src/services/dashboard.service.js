import Issue from "../models/issue.model.js";

/**
 * Aggregates issue statistics by status.
 * @param {Object} filters - Optional constituency filter
 * @returns {Promise<Object>} Aggregated totals
 */
export const getDashboardStats = async (filters = {}) => {
  const matchStage = {};
  if (filters.constituency) {
    matchStage.constituency = filters.constituency;
  }

  const stats = await Issue.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Format into a clean object instead of an array of MongoDB documents
  const formattedStats = {
    total: 0,
    submitted: 0,
    under_review: 0,
    actioned: 0,
    resolved: 0
  };

  stats.forEach(stat => {
    // Prevent overriding if an unknown status is found, or dynamically add it
    if (formattedStats[stat._id] !== undefined) {
      formattedStats[stat._id] = stat.count;
    } else {
      formattedStats[stat._id] = stat.count;
    }
    formattedStats.total += stat.count;
  });

  return formattedStats;
};

/**
 * Aggregates issues by category.
 * @param {Object} filters - Optional constituency filter
 * @returns {Promise<Array>} List of categories and their counts
 */
export const getDashboardCategories = async (filters = {}) => {
  const matchStage = {};
  if (filters.constituency) {
    matchStage.constituency = filters.constituency;
  }

  const categories = await Issue.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } } // Sort descending by count
  ]);

  // Map _id to 'category' for standard JSON response
  return categories.map(cat => ({
    category: cat._id,
    count: cat.count
  }));
};

/**
 * Returns a unified, frontend-friendly JSON object containing all Suggestion dashboard metrics.
 * @param {Object} filters - Optional constituency filter
 * @returns {Promise<Object>} Formatted dashboard JSON
 */
export const getSuggestionDashboardData = async (filters = {}) => {
  // We dynamically import Suggestion here if needed, or we can just import at the top of the file
  // Actually, I should import it at the top of the file. But I'm just appending. Let me use dynamic import
  // to avoid needing multi_replace, or I'll just rely on the next replace to fix it if I can't.
  // Wait, I can just use dynamic import for safety since it's an async function.
  const { default: Suggestion } = await import("../models/suggestion.model.js");

  const matchStage = {};
  if (filters.constituency) {
    matchStage.constituency = String(filters.constituency);
  }

  // Execute all independent database queries in parallel for maximum performance
  const [statusStats, categoryStats, highPriority, latest] = await Promise.all([
    // 1. Status Aggregation (Total, Pending, Completed)
    Suggestion.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    
    // 2. Category Aggregation
    Suggestion.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // 3. High Priority Suggestions (Score >= 8)
    Suggestion.find({ ...matchStage, priorityScore: { $gte: 8 } })
      .sort({ priorityScore: -1, createdAt: -1 })
      .limit(10)
      .populate("citizenId", "name")
      .lean(),

    // 4. Latest Suggestions
    Suggestion.find(matchStage)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("citizenId", "name")
      .lean()
  ]);

  // Format Status Metrics
  const formattedStatus = {
    total: 0,
    pending: 0, // 'submitted' + 'under_review'
    completed: 0, // 'implemented'
    rejected: 0 // 'rejected'
  };

  statusStats.forEach(stat => {
    formattedStatus.total += stat.count;
    if (["submitted", "under_review"].includes(stat._id)) {
      formattedStatus.pending += stat.count;
    } else if (stat._id === "implemented") {
      formattedStatus.completed += stat.count;
    } else if (stat._id === "rejected") {
      formattedStatus.rejected += stat.count;
    }
  });

  // Format Category Metrics
  const formattedCategories = categoryStats.map(cat => ({
    name: cat._id,
    count: cat.count
  }));

  // Construct Final Frontend-Friendly JSON
  return {
    overview: formattedStatus,
    categories: formattedCategories,
    highPrioritySuggestions: highPriority,
    latestSuggestions: latest
  };
};
