import { Router } from "express";

/**
 * Representative Routes
 *
 * Maps HTTP endpoints to representative controller methods.
 */

const router = Router();

import { getRepresentatives, getRepresentativeById, createRepresentative, updateRepresentative, deleteRepresentative } from "../controllers/representative.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { createRepresentativeSchema } from "../schemas/representative.schema.js";

router.get("/", getRepresentatives);
router.get("/:id", getRepresentativeById);
router.post("/", validateRequest(createRepresentativeSchema), createRepresentative);
router.put("/:id", validateRequest(createRepresentativeSchema), updateRepresentative);
router.delete("/:id", deleteRepresentative);
export default router;
