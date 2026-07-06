export const validateSuggestionCreation = (req, res, next) => {
  const { title, description, constituency, citizenId } = req.body;
  const errors = [];
  
  // Basic validation rules (can be replaced by Zod/Joi later)
  if (!citizenId) errors.push("citizenId is required.");
  if (!title || typeof title !== 'string' || title.length < 5) {
    errors.push("title is required and must be at least 5 characters.");
  }
  if (!description || typeof description !== 'string') {
    errors.push("description is required.");
  }
  if (!constituency || typeof constituency !== 'string') {
    errors.push("constituency is required.");
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Validation failed", 
      errors 
    });
  }
  
  next();
};

export const validateSuggestionUpdate = (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({ success: false, message: "Suggestion ID is required in URL" });
  }
  if (!req.body.status) {
    return res.status(400).json({ success: false, message: "status is required in body" });
  }
  next();
};
