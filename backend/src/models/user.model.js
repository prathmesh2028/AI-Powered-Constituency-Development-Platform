import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address"
      ]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false // Prevents returning the password in queries by default
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["citizen", "representative", "admin"],
        message: "Role must be citizen, representative, or admin"
      },
      default: "citizen"
    },
    constituency: {
      type: String,
      required: [true, "Constituency is required"],
      trim: true
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Add single-field index for high-speed queries on constituencies
userSchema.index({ constituency: 1 });

const User = mongoose.model("User", userSchema);

export default User;
