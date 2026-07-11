import * as decisionEngineService from "../services/decisionEngine.service.js";
import * as suggestionService from "../services/suggestion.service.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Fetch all logged decisions, with optional query filters
 */
export const getDecisions = catchAsync(async (req, res) => {
  const filters = {
    constituency: req.query.constituency,
    status: req.query.status
  };

  const decisions = await decisionEngineService.getDecisions(filters);
  res.status(200).json({ success: true, data: decisions });
});

/**
 * Manually evaluate rules for a specific suggestion ID and log decisions
 */
export const evaluateSuggestionId = catchAsync(async (req, res) => {
  const { suggestionId } = req.params;
  if (!suggestionId) {
    return res.status(400).json({ success: false, message: "Suggestion ID is required." });
  }

  const suggestion = await suggestionService.getSuggestionById(suggestionId);
  if (!suggestion) {
    return res.status(404).json({ success: false, message: "Suggestion not found." });
  }

  const decisions = await decisionEngineService.evaluateAndLogDecisionsForSuggestion(suggestion);
  res.status(200).json({ success: true, data: decisions });
});

/**
 * Update the status of a logged decision (e.g., execute or cancel)
 */
export const updateDecisionStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: "Decision ID is required." });
  }
  if (!status || !["pending", "executed", "cancelled"].includes(status)) {
    return res.status(400).json({ success: false, message: "Valid status (pending, executed, cancelled) is required." });
  }

  const updatedDecision = await decisionEngineService.updateDecisionStatus(id, status);
  if (!updatedDecision) {
    return res.status(404).json({ success: false, message: "Decision not found." });
  }

  res.status(200).json({ success: true, data: updatedDecision });
});
