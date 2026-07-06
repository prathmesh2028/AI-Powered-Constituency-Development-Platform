import User from "../models/user.model.js";

/**
 * Retrieves all users with the "representative" role, optionally filtered by constituency.
 * @param {Object} filters - Query parameters
 * @returns {Promise<Object>} List of representative users and metadata
 */
export const getRepresentatives = async (filters = {}) => {
  const query = { role: "representative" };
  
  if (filters.party) query.party = filters.party;
  if (filters.constituency) query.constituency = filters.constituency;

  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.max(parseInt(filters.limit, 10) || 20, 1);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
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
 * Retrieves a specific representative by ID.
 * @param {String} id - User ID
 * @returns {Promise<Object>} Representative user document
 */
export const getRepresentativeById = async (id) => {
  return await User.findOne({ _id: id, role: "representative" })
    .select("-password")
    .lean();
};

/**
 * Creates a new representative.
 * @param {Object} data - Representative data
 * @returns {Promise<Object>} Created user document
 */
export const createRepresentative = async (data) => {
  // Enforce the representative role regardless of the payload
  const rep = new User({ ...data, role: "representative" });
  await rep.save();
  
  // Return the object without the password
  const repObj = rep.toObject();
  delete repObj.password;
  return repObj;
};

/**
 * Updates a representative.
 * @param {String} id - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated representative document
 */
export const updateRepresentative = async (id, updateData) => {
  // Prevent changing the role via this service
  delete updateData.role;
  
  return await User.findOneAndUpdate(
    { _id: id, role: "representative" },
    updateData,
    { new: true, runValidators: true }
  ).select("-password").lean();
};

/**
 * Deletes a representative.
 * @param {String} id - User ID
 * @returns {Promise<Object>} Deleted document
 */
export const deleteRepresentative = async (id) => {
  return await User.findOneAndDelete({ _id: id, role: "representative" });
};
