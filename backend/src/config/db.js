import mongoose from "mongoose";
import config from "../config/index.js";

/**
 * Connect to MongoDB with recommended production options.
 * Exits the process on initial connection failure so the container
 * orchestrator (or nodemon) can restart cleanly.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI, {
      maxPoolSize: 10, // Prevents connection exhaustion on Atlas shared/free tiers
      serverSelectionTimeoutMS: 5000, // Terminate connection attempt fast if cluster is offline
      socketTimeoutMS: 45000, // Close hanging query sockets after 45 seconds
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // ── Connection event listeners ─────────────────────
    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
