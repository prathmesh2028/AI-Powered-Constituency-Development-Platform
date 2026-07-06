import { Router } from "express";

/**
 * Issue Routes
 *
 * Maps HTTP endpoints to issue controller methods.
 * Routes should only define the HTTP verb, path, middleware chain, and controller.
 *
 * @example
 *  import { createIssue, getIssues } from "../controllers/issue.controller.js";
 *  import { validateIssue } from "../validators/issue.validator.js";
 *
 *  router.post("/", validateIssue, createIssue);
 *  router.get("/", getIssues);
 */

const router = Router();

import { createIssue, getIssues, getIssueById, updateIssue, deleteIssue } from "../controllers/issue.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { createIssueSchema } from "../schemas/issue.schema.js";

router.post("/", protect, validateRequest(createIssueSchema), createIssue);
router.get("/", getIssues);
router.get("/:id", getIssueById);
router.put("/:id", validateRequest(createIssueSchema), updateIssue);
router.delete("/:id", deleteIssue);
export default router;
