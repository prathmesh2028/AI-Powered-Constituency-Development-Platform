import { Router } from "express";

/**
 * AI Routes
 *
 * Maps HTTP endpoints to AI (Gemini) controller methods.
 */

const router = Router();

import { summariseIssues, suggestPriorities, analyzeSentiment, analyzeSuggestion } from "../controllers/ai.controller.js";

router.post("/summarise", summariseIssues);
router.get("/suggest-priorities", suggestPriorities);
router.post("/analyze-sentiment", analyzeSentiment);
router.post("/analyze-suggestion", analyzeSuggestion);
export default router;
