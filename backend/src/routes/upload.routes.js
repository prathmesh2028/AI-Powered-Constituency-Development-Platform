import { Router } from "express";

/**
 * Upload Routes
 * 
 * NOTE: Currently configured to use local filesystem storage via Multer.
 * This is acceptable for a hackathon demo, but for production deployment 
 * (e.g. Render, Heroku, AWS), this MUST be migrated to AWS S3 or Cloudinary
 * to avoid data loss on container restarts.
 */
import { uploadImage } from "../middlewares/upload.middleware.js";
import { uploadSingleImage } from "../controllers/upload.controller.js";

const router = Router();

// Endpoint: POST /api/upload/image
// 'image' matches the form-data field name expected by Multer
router.post("/image", uploadImage.single("image"), uploadSingleImage);

export default router;
