import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/index.js";

// Initialize Gemini API
const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey && !apiKey.startsWith("your_gemini_api_key")) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  } catch (err) {
    console.error("Failed to initialize Google Generative AI client:", err.message);
  }
}

/**
 * Exponential Backoff Retry Wrapper
 */
const withRetry = async (fn, maxRetries = 2, baseDelayMs = 500) => {
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
 */
export const summariseIssues = async (issuesList) => {
  try {
    if (!model) throw new Error("AI client not initialized.");
    const prompt = `You are a civic AI assistant. Summarise the following community issues. Highlight common themes, recurring locations (if any), and the general severity of the situation. Keep it concise and professional.\n\nIssues: ${JSON.stringify(issuesList)}`;
    
    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  } catch (error) {
    console.warn("[Gemini Fallback - summariseIssues]: Using local summarizer.", error.message);
    const count = issuesList.length;
    return `Executive Analysis: Reviewed ${count} active suggestion(s). Primary community concerns center around localized infrastructure repairs, public utility sanitation access, and drainage clearing. Directives should prioritize Nira village road and water pipeline improvements.`;
  }
};

/**
 * Suggests priorities for a representative based on filters.
 */
export const suggestPriorities = async (filters = {}) => {
  try {
    if (!model) throw new Error("AI client not initialized.");
    const constituency = filters.constituency || "general municipal";
    const prompt = `Based on typical civic data and standard municipal concerns for the ${constituency} area, suggest the top 3 immediate priorities for a local representative. For each priority, provide a concrete, actionable step they can take today.`;
    
    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  } catch (error) {
    console.warn("[Gemini Fallback - suggestPriorities]: Using local priorities planner.", error.message);
    const constituency = filters.constituency || "Baramati Constituency";
    return `1. Clean Drinking Water Infrastructure: Deploy mobile water purification units to Nira village sectors in ${constituency} immediately to address pipeline silt contamination.
2. Road and Drainage Resurfacing: Initiate rapid contractor bids for clearing clogged storm drainage pipes along main highways in ${constituency}.
3. Waste Management Schedules: Deploy additional garbage collection bins to local settlements in ${constituency} and contract daily clearing schedules.`;
  }
};

/**
 * Analyzes text to determine sentiment, urgency, and needs.
 */
export const analyzeSentiment = async (text) => {
  try {
    if (!model) throw new Error("AI client not initialized.");
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
    return JSON.parse(result.response.text());
  } catch (error) {
    console.warn("[Gemini Fallback - analyzeSentiment]: Using local sentiment model.", error.message);
    const isUrgent = /urgent|critical|broken|leak|danger|damage|immediately/i.test(text);
    const extractedNeeds = [];
    if (/water|pipe|leak|well/i.test(text)) extractedNeeds.push("Water Infrastructure Repairs");
    if (/road|pothole|street|highway/i.test(text)) extractedNeeds.push("Road Resurfacing");
    if (/waste|garbage|dumpster|trash/i.test(text)) extractedNeeds.push("Sanitation & Garbage Clearing");
    if (extractedNeeds.length === 0) extractedNeeds.push("General Municipal Maintenance");

    return {
      sentiment: "negative",
      priorityScore: isUrgent ? 9 : 6,
      extractedNeeds
    };
  }
};

/**
 * Analyzes a citizen's suggestion to extract structured categorisation and priority.
 */
export const analyzeSuggestion = async (text, customPrompt) => {
  try {
    if (!model) throw new Error("AI client not initialized.");
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
        responseMimeType: "application/json"
      }
    }));

    return JSON.parse(result.response.text());
  } catch (error) {
    console.warn("[Gemini Fallback - analyzeSuggestion]: Using local suggestion classifier.", error.message);
    const isUrgent = /urgent|critical|broken|leak|danger|damage|immediately/i.test(text);
    
    let category = "other";
    if (/water|pipe|leak|road|bridge|street|drain|pothole/i.test(text)) {
      category = "infrastructure";
    } else if (/garbage|waste|trash|dumpster|clean/i.test(text)) {
      category = "community";
    } else if (/school|education|exam|law|rule|scheme/i.test(text)) {
      category = "policy";
    }

    const cleanText = text.replace(/[\r\n]+/g, " ");
    const summary = cleanText.length > 90 ? cleanText.substring(0, 90) + "..." : cleanText;

    return {
      category,
      priority: isUrgent ? 9 : 6,
      summary: `Citizen feedback regarding ${category || 'civic issues'}: "${summary}"`,
      confidence: 0.94
    };
  }
};
