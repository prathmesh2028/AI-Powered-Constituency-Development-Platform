import mongoose from "mongoose";

/**
 * Issue Model
 *
 * Defines the MongoDB schema for constituency issues/complaints.
 * Models should:
 *  - Define the schema with types, validations, and defaults
 *  - Add indexes for frequently queried fields
 *  - Define instance/static methods if needed
 *  - NOT contain business logic (that belongs in services)
 *
 * @example
 *  const issueSchema = new mongoose.Schema({
 *    title:       { type: String, required: true, trim: true },
 *    description: { type: String, required: true },
 *    category:    { type: String, enum: [...], required: true },
 *    status:      { type: String, enum: ["open","in_progress","resolved"], default: "open" },
 *    location:    { type: String },
 *    reportedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
 *    images:      [{ type: String }],
 *  }, { timestamps: true });
 */

// TODO: Define schema and export model
// export default mongoose.model("Issue", issueSchema);
