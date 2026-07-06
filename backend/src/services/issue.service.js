import Issue from "../models/issue.model.js";

/**
 * Creates a new constituency issue in the database.
 * @param {Object} data - The issue data payload
 * @returns {Promise<Object>} The created issue
 */
export const createIssue = async (data) => {
  const issue = new Issue(data);
  return await issue.save();
};

/**
 * Retrieves a list of issues with optional filtering.
 * @param {Object} filters - Query filters (e.g., constituency, category)
 * @returns {Promise<Array>} List of issues
 */
export const getIssues = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.constituency) filter.constituency = query.constituency;

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit, 10) || 20, 1);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reportedBy", "name email")
      .lean(),
    Issue.countDocuments(filter)
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
 * Retrieves a single issue by its ID.
 * @param {String} id - The MongoDB ObjectId of the issue
 * @returns {Promise<Object>} The populated issue
 */
export const getIssueById = async (id) => {
  // Populate citizenId assuming User model is registered
  return await Issue.findById(id).populate("citizenId", "name email").lean();
};

/**
 * Updates an issue by ID.
 * @param {String} id - The issue ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} The updated issue
 */
export const updateIssue = async (id, updateData) => {
  return await Issue.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  }).lean();
};

/**
 * Deletes an issue by ID.
 * @param {String} id - The issue ID
 * @returns {Promise<Object>} The deleted issue document
 */
export const deleteIssue = async (id) => {
  return await Issue.findByIdAndDelete(id);
};
