import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/index.js";

// Initialize Gemini API
const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Exponential Backoff Retry Wrapper
 * Retries a promise-returning function up to maxRetries times.
 */
const withRetry = async (fn, maxRetries = 3, baseDelayMs = 1000) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      console.warn(`[Gemini API] Request failed. Retrying attempt ${attempt}... Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }
};

/**
 * Summarises a list of issues into a concise text.
 * @param {Array} issuesList - Array of issue objects or descriptions
 * @returns {Promise<String>} The generated summary
 */
export const summariseIssues = async (issuesList) => {
  try {
    const prompt = `You are a civic AI assistant. Summarise the following community issues. Highlight common themes, recurring locations (if any), and the general severity of the situation. Keep it concise and professional.\n\nIssues: ${JSON.stringify(issuesList)}`;
    
    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  } catch (error) {
    throw new Error(`Gemini Summarisation Failed: ${error.message}`);
  }
};

/**
 * Suggests priorities for a representative based on filters.
 * @param {Object} filters - Includes constituency or specific area constraints
 * @returns {Promise<String>} Actionable priority list
 */
export const suggestPriorities = async (filters = {}) => {
  try {
    const constituency = filters.constituency || "general municipal";
    const prompt = `Based on typical civic data and standard municipal concerns for the ${constituency} area, suggest the top 3 immediate priorities for a local representative. For each priority, provide a concrete, actionable step they can take today.`;
    
    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  } catch (error) {
    throw new Error(`Gemini Prioritization Failed: ${error.message}`);
  }
};

/**
 * Analyzes text to determine sentiment, urgency, and needs.
 * @param {String} text - The issue description
 * @returns {Promise<Object>} Parsed JSON containing sentiment metrics
 */
export const analyzeSentiment = async (text) => {
  try {
    const prompt = `Analyze the following issue text. Return a JSON object with EXACTLY these three keys: 
    1. "sentiment" (must be "positive", "neutral", or "negative")
    2. "priorityScore" (an integer from 1 to 10, where 10 is most urgent)
    3. "extractedNeeds" (an array of strings summarizing the core requirements).
    
    Do NOT wrap the response in markdown blocks like \`\`\`json. Return raw JSON only.
    
    Text: "${text}"`;
    
    const result = await withRetry(() => model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }));
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Gemini Sentiment Analysis Failed: ${error.message}`);
  }
};

/**
 * Analyzes a citizen's suggestion to extract structured categorisation and priority.
 * @param {String} text - The raw suggestion text
 * @param {String} [customPrompt] - Configurable prompt override
 * @returns {Promise<Object>} JSON containing category, priority, summary, confidence
 */
export const analyzeSuggestion = async (text, customPrompt) => {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const defaultPrompt = `Analyze the following suggestion submitted by a citizen.
Extract the following information:
- category: The most relevant category (e.g., infrastructure, policy, community, other).
- priority: An integer from 1 to 10 (10 being most urgent).
- summary: A concise 1-2 sentence summary of the suggestion.
- confidence: A float from 0.0 to 1.0 representing your confidence in this analysis.

Suggestion: "${text}"`;

    const prompt = customPrompt || defaultPrompt;

    const result = await withRetry(() => model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        // Forces the model to output strict JSON
        responseMimeType: "application/json"
      }
    }));

    const responseText = result.response.text();
    return JSON.parse(responseText);
    
  } catch (error) {
    // Handle API failures gracefully by logging and throwing a sanitized error
    console.error("[Gemini API Error - analyzeSuggestion]:", error.message);
    throw new Error("AI Analysis is temporarily unavailable. Please try again later.");
  }
};
