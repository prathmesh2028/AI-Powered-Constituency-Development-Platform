/**
 * Upload Controller
 * Handles the final response after Multer middleware processes the file.
 */

export const uploadSingleImage = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded or invalid file type" });
    }

    // Construct the public URL for the uploaded file
    // req.protocol (e.g., 'http') + req.get('host') (e.g., 'localhost:5000') + '/uploads/' + filename
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};
