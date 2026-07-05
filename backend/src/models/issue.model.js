import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
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
      trim: true,
      minlength: [20, "Description must be at least 20 characters to enable AI analysis"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["infrastructure", "sanitation", "utilities", "education", "health", "other"],
        message: "Invalid category selected"
      }
    },
    constituency: {
      type: String,
      required: [true, "Constituency is required"],
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point"
      },
      coordinates: {
        type: [Number], // Format: [longitude, latitude]
        required: [true, "Geographical coordinates are required"]
      },
      address: {
        type: String,
        trim: true
      }
    },
    mediaUrls: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["submitted", "under_review", "actioned", "resolved"],
        message: "Invalid status value"
      },
      default: "submitted"
    }
  },
  {
    timestamps: true
  }
);

// Indexes
issueSchema.index({ citizenId: 1 });
issueSchema.index({ constituency: 1 });
issueSchema.index({ status: 1, constituency: 1 }); // Compound index for filtered dashboards
issueSchema.index({ location: "2dsphere" }); // Geospatial indexing for radius proximity searches

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
