import { Router } from "express";
import * as decisionController from "../controllers/decision.controller.js";

const router = Router();

// Retrieve all logged decisions
router.get("/", decisionController.getDecisions);

// Evaluate and log decisions for a suggestion
router.post("/evaluate/:suggestionId", decisionController.evaluateSuggestionId);

// Update status of a decision
router.patch("/:id/status", decisionController.updateDecisionStatus);

export default router;
