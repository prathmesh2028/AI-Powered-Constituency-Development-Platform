import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Citizen reference ID is required"]
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [5, "Title must be at least 5 characters"],
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ["infrastructure", "policy", "community", "other"],
      message: "Invalid category"
    },
    default: "other"
  },
  constituency: {
    type: String,
    required: [true, "Constituency is required"],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true
  },
  village: {
    type: String,
    required: [true, "Village name is required"],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ["submitted", "under_review", "implemented", "rejected"],
      message: "Invalid status"
    },
    default: "submitted"
  },
  priorityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: null // Null initially, populated after AI analysis
  }
}, { timestamps: true });

// Indexes for fast retrieval by constituency and citizen
suggestionSchema.index({ constituency: 1, status: 1 });
suggestionSchema.index({ citizenId: 1 });
suggestionSchema.index({ priorityScore: -1 }); // Fast retrieval for high priority

export default mongoose.model("Suggestion", suggestionSchema);
