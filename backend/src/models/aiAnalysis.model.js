import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue reference ID is required"],
      unique: true // Enforces strict 1-to-1 relationship with the Issue
    },
    sentiment: {
      type: String,
      required: [true, "Sentiment analysis is required"],
      enum: {
        values: ["positive", "neutral", "negative"],
        message: "Sentiment must be positive, neutral, or negative"
      }
    },
    priorityScore: {
      type: Number,
      required: [true, "Priority score is required"],
      min: [1, "Priority score must be at least 1"],
      max: [10, "Priority score cannot exceed 10"],
      validate: {
        validator: Number.isInteger,
        message: "Priority score must be an integer value"
      }
    },
    extractedNeeds: {
      type: [String],
      default: []
    },
    isFeasible: {
      type: Boolean,
      required: [true, "Feasibility assessment is required"],
      default: true
    },
    reasoning: {
      type: String,
      required: [true, "AI reasoning is required"],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
aiAnalysisSchema.index({ issueId: 1 });
aiAnalysisSchema.index({ priorityScore: -1 }); // Fast descending sort for prioritizing issues

const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema);

export default AIAnalysis;
