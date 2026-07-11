import * as agentLayerService from "../services/agentLayer.service.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Endpoint POST /api/v1/ai/agent-chat
 * Establishes an SSE stream connection and pipes the AI agent response.
 */
export const handleAgentChatStream = catchAsync(async (req, res) => {
  const { query, constituency, agentType = "auto", taskType = "chat" } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ success: false, message: "Query text is required." });
  }

  if (!constituency || !constituency.trim()) {
    return res.status(400).json({ success: false, message: "Constituency context is required." });
  }

  // Stream AI response using Server-Sent Events (SSE)
  await agentLayerService.streamAgentResponse(res, {
    query,
    constituency,
    agentType,
    taskType
  });
});
