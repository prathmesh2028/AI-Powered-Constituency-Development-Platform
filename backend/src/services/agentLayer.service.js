import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/index.js";
import Suggestion from "../models/suggestion.model.js";
import { AGENT_PROMPTS, getTaskFormattingPrompt } from "../config/agentPrompts.js";

// Initialize Gemini API
const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey && !apiKey.startsWith("your_gemini_api_key")) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  } catch (err) {
    console.error("Failed to initialize Generative AI client in Agent Layer:", err.message);
  }
}

/**
 * Helper to fetch suggestions from MongoDB that match the agent's target area
 */
export const getContextSuggestions = async (constituency, agentType, query = "") => {
  const queryObj = { constituency: String(constituency) };
  
  // Define categories or description regex searches based on agent domain
  let categoryFilter = [];
  let keywordRegex = null;

  switch (agentType) {
    case "crowd":
      categoryFilter = ["policy", "other"];
      keywordRegex = /crowd|density|market|pedestrian|hawker|obstruct|station road|congestion/i;
      break;
    case "medical":
      categoryFilter = ["community", "other"];
      keywordRegex = /water|pipe|leak|contamination|disease|hospital|health|medical|clinic|outbreak/i;
      break;
    case "security":
      categoryFilter = ["infrastructure", "community"];
      keywordRegex = /light|streetlights|cctv|security|safety|dark|vandalism|lock/i;
      break;
    case "volunteer":
      categoryFilter = ["community", "other"];
      keywordRegex = /garbage|trash|clean|dumpster|volunteer|manpower|cleanup/i;
      break;
    case "accessibility":
      categoryFilter = ["infrastructure"];
      keywordRegex = /ramp|walkway|pavement|skywalk|bridge|railings|senior|blind|wheelchair/i;
      break;
    case "transport":
      categoryFilter = ["infrastructure"];
      keywordRegex = /traffic|road|pothole|blocked|highway|transit|detour|flyover|bridge/i;
      break;
    default:
      // Executive agent matches everything
      categoryFilter = [];
  }

  const conditions = [];
  if (categoryFilter.length > 0) {
    conditions.push({ category: { $in: categoryFilter } });
  }
  if (keywordRegex) {
    conditions.push({
      $or: [
        { title: { $regex: keywordRegex } },
        { description: { $regex: keywordRegex } }
      ]
    });
  }

  // Also query search terms from user's natural query if any
  if (query && query.length > 5) {
    const queryWords = query.split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/[^\w]/g, ""));
    if (queryWords.length > 0) {
      const matchWordsRegex = new RegExp(queryWords.join("|"), "i");
      conditions.push({
        $or: [
          { title: { $regex: matchWordsRegex } },
          { description: { $regex: matchWordsRegex } }
        ]
      });
    }
  }

  if (conditions.length > 0) {
    queryObj.$or = conditions.flatMap(c => c.$or || c);
  }

  // Retrieve top 5 matching grievances sorted by priority score (high to low)
  return await Suggestion.find(queryObj)
    .sort({ priorityScore: -1, createdAt: -1 })
    .limit(5)
    .lean();
};

/**
 * Classify user natural query to route to the correct agent
 */
export const classifyAgentType = (queryText) => {
  const text = queryText.toLowerCase();

  if (/crowd|density|market|pedestrian|hawker|street market|footpath crowd/i.test(text)) {
    return "crowd";
  }
  if (/water|pipeline|contamination|sewage|disease|hospital|clinic|doctor|medical|health/i.test(text)) {
    return "medical";
  }
  if (/light|streetlights|cctv|security|patrol|safety|darkness|vandalism|lock/i.test(text)) {
    return "security";
  }
  if (/garbage|trash|clean|dumpster|cleanup|volunteer|manpower/i.test(text)) {
    return "volunteer";
  }
  if (/ramp|skywalk|pedestrian crossing|walkway|wheelchair|senior citizens/i.test(text)) {
    return "accessibility";
  }
  if (/traffic|road|pothole|blocked|highway|transit|detour|flyover|bridge/i.test(text)) {
    return "transport";
  }

  return "executive"; // Orchestration default
};

/**
 * Compile a rich mock streaming text response based on query details
 */
const getMockResponse = (agentType, taskType, suggestions, query) => {
  const matchCount = suggestions.length;
  const villageList = suggestions.map(s => s.village || "local areas").join(", ");

  let responseText = "";

  if (taskType === "briefing") {
    responseText = `# EXECUTIVE BRIEFING: Member of Parliament (MP) Office\n\n## 1. Overview\nThis briefing analyzes the ${agentType.toUpperCase()} status across target sectors. There are ${matchCount} active complaints under review.\n\n## 2. Hotspots Identified\nPrimary concerns reside in: ${villageList || "various village sectors"}.\n\n## 3. Core Concerns & Safety Hazards\n- High density reports related to ${agentType} infrastructure.\n- Risk metrics index indicates localized disruptions require immediate grant allocations.\n\n## 4. Recommended Policy Actions\n- Direct immediate budget release to address village utilities.\n- Request standard administrative oversight visits to hotspots in the upcoming week.`;
  } else if (taskType === "incident_report") {
    responseText = `# INCIDENT REPORT SCHEMA\n\n- **Incident ID**: INC-${Math.floor(1000 + Math.random() * 9000)}\n- **Category**: ${agentType.toUpperCase()}\n- **Location Context**: ${villageList || "Constituency Sector"}\n- **Detailed Severity**: Urgent concerns require attention to mitigate secondary safety escalations.\n- **Stakeholders Affected**: Local residents, school children, and village merchants.\n- **Mitigation Policy**: Ensure appropriate municipal departments are alerted for inspections.`;
  } else if (taskType === "voice_response") {
    responseText = `"Hello, this is the MP Citizen helpline. We have registered your concern regarding ${agentType} issues in your village. Our municipal teams are scheduled to review it, and you can track status updates using your submission ID. Thank you for your feedback."`;
  } else if (taskType === "translation") {
    responseText = `Original text translated to English: "Grievance submitted regarding local ${agentType} concern. Residents in ${villageList || "this sector"} request immediate inspections to restore public utilities."`;
  } else {
    // Summary or General natural language query response
    responseText = `### ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent Report\n\nI have reviewed active grievances related to your query: "${query}".\n\nThere are **${matchCount} active reports** matching this domain in the database. The primary issues involve local repairs and utilities. \n\n**Action Summary:**\n- The deterministic Mitigation Matrix has already logged corresponding ledger entries (e.g. scheduling coordinators or warning alerts).\n- The responsible municipal team has been notified and standard reviews are active.`;
  }

  return responseText;
};

/**
 * Handle streaming SSE responses for the Multi-Agent Layer
 */
export const streamAgentResponse = async (res, { query, constituency, agentType = "auto", taskType = "chat" }) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Determine active agent type
  let activeAgent = agentType;
  if (agentType === "auto") {
    activeAgent = classifyAgentType(query);
  }

  // Fetch relevant DB suggestions
  const suggestions = await getContextSuggestions(constituency, activeAgent, query);

  // Modular prompts formulation
  const systemPrompt = AGENT_PROMPTS[activeAgent] || AGENT_PROMPTS.executive;
  const formattingPrompt = getTaskFormattingPrompt(taskType);

  const contextText = suggestions.map((s, idx) => 
    `[Grievance #${idx + 1}] Village: ${s.village}, Category: ${s.category}, Title: ${s.title}, Severity: ${s.priorityScore || 5}/10, Status: ${s.status}, Description: ${s.description}`
  ).join("\n\n");

  const finalPrompt = `
System Instructions:
${systemPrompt}

Grievance Reports Context from database (highly relevant to the user query):
${contextText || "No matching reports found in database."}

User Request/Query:
"${query}"

Output Formatting:
${formattingPrompt}

Strict Directive: Remember you are an AI assistant. Do NOT decide to execute, dispatch, open, or close anything yourself. Leave all operational decisions to the deterministic engine. Only summarize, translate, brief, or explain.
`;

  try {
    if (!model) throw new Error("Google GenAI client not initialized.");

    // Run Gemini Stream
    const resultStream = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
    });

    for await (const chunk of resultStream.stream) {
      const textChunk = chunk.text();
      res.write(`data: ${JSON.stringify({ 
        text: textChunk, 
        agentType: activeAgent, 
        contextSuggestions: suggestions 
      })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error) {
    console.warn(`[Gemini Stream Fallback - ${activeAgent}]: Simulating streaming mock fallback.`, error.message);

    // High fidelity mock stream fallback
    const mockText = getMockResponse(activeAgent, taskType, suggestions, query);
    const words = mockText.split(" ");
    
    // Stream mock chunks
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let i = 0; i < words.length; i += 3) {
      const chunkText = words.slice(i, i + 3).join(" ") + " ";
      res.write(`data: ${JSON.stringify({ 
        text: chunkText, 
        agentType: activeAgent, 
        contextSuggestions: suggestions,
        isFallback: true 
      })}\n\n`);
      await sleep(120); // Simulates text-typing streaming output delay
    }

    res.write("data: [DONE]\n\n");
    res.end();
  }
};
