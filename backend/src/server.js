import mongoose from "mongoose";
import config from "./config/index.js";
import connectDB from "./config/db.js";
import app from "./app.js";

/**
 * Bootstrap sequence:
 *  1. Connect to MongoDB
 *  2. Start the HTTP server
 *  3. Register graceful-shutdown hooks
 */
const startServer = async () => {
  // 0 ── Environment Validation ────────────────────────
  const requiredEnvVars = ["PORT", "MONGODB_URI", "GEMINI_API_KEY"];
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error(`💥 FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(", ")}`);
    console.error(`💡 GCP Cloud Run Setup Tip: Make sure you have created the secrets (e.g. MONGODB_URI, GEMINI_API_KEY) in GCP Secret Manager and mapped them as environment variables in Cloud Run, or set them as environment variables directly.`);
    process.exit(1);
  }

  // 1 ── Database ──────────────────────────────────────
  await connectDB();

  // 2 ── HTTP server ───────────────────────────────────
  const server = app.listen(config.port, () => {
    console.log(
      `🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`
    );
  });

  // 3 ── Graceful shutdown ─────────────────────────────
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await mongoose.connection.close();
      console.log("🛑 HTTP server and DB connections closed");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Catch unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error("💥 Unhandled Rejection:", err);
    server.close(() => process.exit(1));
  });

  // Catch uncaught synchronous exceptions
  process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err);
    server.close(() => process.exit(1));
  });
};

startServer();
