import multer from "multer";
import path from "path";

/**
 * Upload Middleware
 *
 * Configures Multer for handling multipart/form-data file uploads.
 * Defines storage destination, filename strategy, and file filters.
 *
 * @example
 *  // In a route file:
 *  import { uploadImage } from "../middlewares/upload.middleware.js";
 *
 *  router.post("/issues", uploadImage.single("image"), createIssue);
 *  router.post("/gallery", uploadImage.array("images", 5), uploadGallery);
 */

import fs from "fs";

// Ensure uploads directory exists
const UPLOAD_DIR = "uploads/";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
