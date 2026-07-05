import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    representativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Representative reference ID is required"]
    },
    constituency: {
      type: String,
      required: [true, "Constituency is required"],
      trim: true
    },
    title: {
      type: String,
      required: [true, "Recommendation title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    summary: {
      type: String,
      required: [true, "AI recommendation summary is required"],
      trim: true
    },
    actionSteps: {
      type: [String],
      default: []
    },
    linkedIssueIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue"
      }
    ],
    estimatedImpact: {
      type: String,
      required: [true, "Estimated impact level is required"],
      enum: {
        values: ["high", "medium", "low"],
        message: "Estimated impact must be high, medium, or low"
      }
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "implemented", "archived"],
        message: "Invalid recommendation status"
      },
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// Indexes
recommendationSchema.index({ constituency: 1 });
recommendationSchema.index({ status: 1 });
recommendationSchema.index({ representativeId: 1 });

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
