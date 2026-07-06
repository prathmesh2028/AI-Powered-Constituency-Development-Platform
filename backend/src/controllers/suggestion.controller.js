import * as suggestionService from "../services/suggestion.service.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Controller: Handles POST /api/suggestions
 * Assumes req.body has already passed through Zod validation middleware.
 */
export const createSuggestion = catchAsync(async (req, res) => {
  const suggestion = await suggestionService.createSuggestion(req.body);
  res.status(201).json({ success: true, data: suggestion });
});

export const getSuggestions = catchAsync(async (req, res) => {
  const paginatedResult = await suggestionService.getSuggestions(req.query);
  res.status(200).json({ success: true, ...paginatedResult });
});

export const getSuggestionById = catchAsync(async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ success: false, message: "Suggestion ID is required" });
  }
  const suggestion = await suggestionService.getSuggestionById(req.params.id);
  if (!suggestion) {
    return res.status(404).json({ success: false, message: "Suggestion not found" });
  }
  res.status(200).json({ success: true, data: suggestion });
});

export const updateSuggestionStatus = catchAsync(async (req, res) => {
  const updatedSuggestion = await suggestionService.updateSuggestionStatus(req.params.id, req.body.status);
  if (!updatedSuggestion) {
    return res.status(404).json({ success: false, message: "Suggestion not found" });
  }
  res.status(200).json({ success: true, data: updatedSuggestion });
});

