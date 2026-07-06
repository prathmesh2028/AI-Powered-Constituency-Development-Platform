import Suggestion from "../models/suggestion.model.js";

/**
 * Creates a new citizen suggestion in the database.
 * @param {Object} data - Suggestion data
 * @returns {Promise<Object>} Created suggestion
 */
export const createSuggestion = async (data) => {
  // Model strictly enforces required fields based on Schema
  const suggestion = new Suggestion({
    citizenId: data.citizenId,
    title: data.title,
    description: data.description,
    category: data.category,
    constituency: data.constituency,
    phoneNumber: data.phoneNumber,
    village: data.village
  });
  
  return await suggestion.save();
};

/**
 * Retrieves suggestions with optional filtering.
 * @param {Object} filters - Filters (constituency, status, citizenId)
 * @returns {Promise<Array>} List of suggestions
 */
export const getSuggestions = async (filters = {}) => {
  const query = {};
  
  // Safe filtering
  if (filters.constituency) query.constituency = String(filters.constituency);
  if (filters.status) query.status = String(filters.status);
  if (filters.citizenId) query.citizenId = String(filters.citizenId);
  
  // Pagination
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.max(parseInt(filters.limit, 10) || 20, 1);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Suggestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("citizenId", "name email")
      .lean(),
    Suggestion.countDocuments(query)
  ]);

  return {
    data,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Retrieves a single suggestion by ID.
 * @param {String} id - Suggestion ID
 * @returns {Promise<Object>} Populated suggestion document
 */
export const getSuggestionById = async (id) => {
  return await Suggestion.findById(id)
    .populate("citizenId", "name email")
    .lean();
};

/**
 * Updates the status of a suggestion.
 * @param {String} id - Suggestion ID
 * @param {String} status - New status
 * @returns {Promise<Object>} Updated document
 */
export const updateSuggestionStatus = async (id, status) => {
  return await Suggestion.findByIdAndUpdate(
    id, 
    { status }, 
    { new: true, runValidators: true }
  ).lean();
};
