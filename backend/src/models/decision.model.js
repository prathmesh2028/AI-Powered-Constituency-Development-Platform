import mongoose from "mongoose";

const decisionSchema = new mongoose.Schema(
  {
    suggestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suggestion",
      required: false
    },
    constituency: {
      type: String,
      required: [true, "Constituency is required"],
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    action: {
      type: String,
      required: true,
      enum: {
        values: [
          "Dispatch Volunteers",
          "Open Gates",
          "Close Gates",
          "Broadcast Messages",
          "Medical Escalation",
          "Transport Diversion",
          "Parking Redirection"
        ],
        message: "Invalid decision action"
      }
    },
    decision: {
      type: String,
      required: [true, "Decision detail is required"],
      trim: true
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true
    },
    expectedImpact: {
      type: String,
      required: [true, "Expected impact is required"],
      trim: true
    },
    responsibleTeam: {
      type: String,
      required: [true, "Responsible team is required"],
      trim: true
    },
    eta: {
      type: String,
      required: [true, "ETA is required"],
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "executed", "cancelled"],
        message: "Invalid status value"
      },
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast querying
decisionSchema.index({ constituency: 1 });
decisionSchema.index({ status: 1 });
decisionSchema.index({ suggestionId: 1 });

const Decision = mongoose.model("Decision", decisionSchema);

export default Decision;
