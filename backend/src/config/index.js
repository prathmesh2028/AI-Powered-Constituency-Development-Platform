import dotenv from "dotenv";

// Load environment variables BEFORE anything else
dotenv.config();

/**
 * Centralized configuration object.
 * All environment-dependent values are read here so the rest of the app
 * never touches process.env directly.
 */
const config = {
  // ── Server ────────────────────────────────────────────
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  get isDev() {
    return this.nodeEnv === "development";
  },
  get isProd() {
    return this.nodeEnv === "production";
  },

  // ── MongoDB ───────────────────────────────────────────
  mongoURI:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/constituency-dev-platform",

  // ── Gemini API ────────────────────────────────────────
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  // ── CORS ──────────────────────────────────────────────
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};

// ── Startup validation ──────────────────────────────────
// Fail fast if critical env vars are missing in production
const requiredInProd = ["MONGODB_URI", "GEMINI_API_KEY"];

if (config.isProd) {
  const missing = requiredInProd.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    console.error(`💡 GCP Cloud Run Setup Tip: Make sure you have created the secrets (e.g. MONGODB_URI, GEMINI_API_KEY) in GCP Secret Manager and mapped them as environment variables in Cloud Run, or set them as environment variables directly.`);
    process.exit(1);
  }
}

export default config;

