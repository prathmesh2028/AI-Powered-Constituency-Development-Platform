import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// ── Express app ─────────────────────────────────────────
const app = express();

// ── Security headers ────────────────────────────────────
app.use(helmet());

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
mountRoutes(app);

// ── Health-check endpoint ───────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ── Global error handler ────────────────────────────────
app.use(errorHandler);

export default app;
