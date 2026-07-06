import { Router } from "express";
import { getDashboardStats, getDashboardCategories, getSuggestionDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

// Legacy Issue-based metrics
router.get("/stats", getDashboardStats);
router.get("/categories", getDashboardCategories);

// Unified frontend-friendly Suggestion metrics
router.get("/suggestions", getSuggestionDashboard);

export default router;
