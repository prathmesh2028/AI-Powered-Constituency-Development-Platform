/**
 * AI Controller
 *
 * Handles HTTP request/response logic for Gemini AI-powered features.
 * (e.g., issue summarisation, priority suggestions, sentiment analysis)
 */

import * as geminiService from "../services/gemini.service.js";
import catchAsync from "../utils/catchAsync.js";

export const summariseIssues = catchAsync(async (req, res) => {
  const { issues } = req.body;
  if (!issues || !Array.isArray(issues)) {
    return res.status(400).json({ success: false, message: "Please provide an array of issues." });
  }
  const summary = await geminiService.summariseIssues(issues);
  res.status(200).json({ success: true, data: { summary } });
});

export const suggestPriorities = catchAsync(async (req, res) => {
  const filters = req.query;
  const priorities = await geminiService.suggestPriorities(filters);
  res.status(200).json({ success: true, data: { priorities } });
});

export const analyzeSentiment = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: "Text is required for sentiment analysis." });
  }
  const analysis = await geminiService.analyzeSentiment(text);
  res.status(200).json({ success: true, data: analysis });
});

export const analyzeSuggestion = catchAsync(async (req, res) => {
  const { suggestionText, customPrompt } = req.body;
  if (!suggestionText) {
    return res.status(400).json({ success: false, message: "suggestionText is required" });
  }
  const analysis = await geminiService.analyzeSuggestion(suggestionText, customPrompt);
  res.status(200).json({ success: true, data: analysis });
});
