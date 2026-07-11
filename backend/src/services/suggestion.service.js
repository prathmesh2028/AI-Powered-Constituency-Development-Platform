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

  // Automatically determine or fall back on priorityScore
  if (data.priorityScore) {
    suggestion.priorityScore = data.priorityScore;
  } else {
    try {
      const { analyzeSuggestion } = await import("./gemini.service.js");
      const analysis = await analyzeSuggestion(data.description);
      if (analysis && analysis.priority) {
        suggestion.priorityScore = analysis.priority;
        if (analysis.category && (!data.category || data.category === "other")) {
          suggestion.category = analysis.category;
        }
      } else {
        const isUrgent = /urgent|critical|broken|leak|danger|damage|immediately/i.test(data.description);
        suggestion.priorityScore = isUrgent ? 9 : 6;
      }
    } catch (err) {
      console.warn("Failed to auto-analyze suggestion priority in backend:", err.message);
      const isUrgent = /urgent|critical|broken|leak|danger|damage|immediately/i.test(data.description);
      suggestion.priorityScore = isUrgent ? 9 : 6;
    }
  }
  
  const savedSuggestion = await suggestion.save();

  // Evaluate decisions immediately via Rule Engine
  try {
    const { evaluateAndLogDecisionsForSuggestion } = await import("./decisionEngine.service.js");
    await evaluateAndLogDecisionsForSuggestion(savedSuggestion);
  } catch (decErr) {
    console.error("Decision Engine evaluation failed on creation:", decErr.message);
  }

  // Broadcast via WebSockets
  if (global.wss) {
    global.wss.clients.forEach(client => {
      if (client.readyState === 1) { // 1 === OPEN
        client.send(JSON.stringify({
          type: "NEW_SUGGESTION",
          data: savedSuggestion
        }));
      }
    });
  }

  return savedSuggestion;
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
  const updatedSuggestion = await Suggestion.findByIdAndUpdate(
    id, 
    { status }, 
    { new: true, runValidators: true }
  ).lean();

  if (updatedSuggestion) {
    try {
      const { evaluateAndLogDecisionsForSuggestion } = await import("./decisionEngine.service.js");
      await evaluateAndLogDecisionsForSuggestion(updatedSuggestion);
    } catch (decErr) {
      console.error("Decision Engine evaluation failed on status update:", decErr.message);
    }

    // Broadcast update via WebSockets
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: "SUGGESTION_UPDATE",
            data: updatedSuggestion
          }));
        }
      });
    }
  }

  return updatedSuggestion;
};
