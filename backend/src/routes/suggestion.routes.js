import { Router } from "express";
import * as suggestionController from "../controllers/suggestion.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { createSuggestionSchema, updateSuggestionStatusSchema } from "../schemas/suggestion.schema.js";

const router = Router();

// Create a new suggestion with strict Zod validation
router.post("/", validateRequest(createSuggestionSchema), suggestionController.createSuggestion);

// Seed suggestions
router.get("/seed", suggestionController.seedSuggestions);

// Get all suggestions (optionally filtered by query)
router.get("/", suggestionController.getSuggestions);

// Get suggestion by ID
router.get("/:id", suggestionController.getSuggestionById);

// Update a suggestion status with Zod validation
router.patch("/:id/status", validateRequest(updateSuggestionStatusSchema), suggestionController.updateSuggestionStatus);

export default router;
