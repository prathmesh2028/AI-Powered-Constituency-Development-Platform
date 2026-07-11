import { Router } from "express";
import * as agentController from "../controllers/agent.controller.js";

const router = Router();

// Streaming endpoint for agent interactions
router.post("/agent-chat", agentController.handleAgentChatStream);

export default router;
