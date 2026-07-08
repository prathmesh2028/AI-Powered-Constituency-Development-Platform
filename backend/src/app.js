import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import config from "./config/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// ── Express app ─────────────────────────────────────────
const app = express();

// Trust reverse proxy (required if deployed behind Render/Heroku/AWS LB)
app.set('trust proxy', 1);

import { globalRateLimiter } from "./middlewares/rateLimiter.middleware.js";

// ── Security headers & Rate Limiting ────────────────────
app.use(helmet());
app.use("/api/", globalRateLimiter); // Apply global limit to all API routes

// ── Request logging ─────────────────────────────────────
app.use(morgan(config.isDev ? "dev" : "combined"));

// ── CORS ────────────────────────────────────────────────
const allowedOrigins = config.corsOrigin
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body parsers ────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static files (uploaded assets, etc.) ────────────────
app.use("/uploads", express.static("uploads"));

// ─────────────────────────────────────────────────────────
//  ROUTES — register your routers below this line
// ─────────────────────────────────────────────────────────
import mountRoutes from "./routes/index.js";
import { requestLogger } from "./middlewares/logger.middleware.js";

// Optional: You could use requestLogger alongside morgan if you want custom formats
app.use(requestLogger);

mountRoutes(app);

// ── Root endpoint ───────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).send(`
    <html>
      <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f4f8; margin: 0;">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h1 style="color: #2c3e50;">🏛️ Constituency Platform API</h1>
          <p style="color: #7f8c8d; font-size: 1.1em;">The backend is running successfully!</p>
          <div style="margin-top: 20px;">
            <a href="/api/health" style="display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Check Health Status</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// ── Health-check endpoint ───────────────────────────────
app.get("/api/health", (_req, res) => {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  const readyState = mongoose.connection.readyState;
  const dbStatus = dbStates[readyState] || "unknown";

  res.status(200).json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    database: {
      status: dbStatus,
      readyState: readyState
    },
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

import { notFoundHandler } from "./middlewares/notFound.middleware.js";

// ── 404 handler ─────────────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler ────────────────────────────────
app.use(errorHandler);

export default app;
