import { z } from "zod";

/**
 * Zod Schema for Suggestion Creation
 * Stricty enforces data types, lengths, and formats before hitting the controller.
 */
export const createSuggestionSchema = z.object({
  citizenId: z.string().length(24, "Invalid Citizen ID format (must be 24-character ObjectId)"),
  
  title: z.string()
    .min(5, "Title must be at least 5 characters long")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
    
  description: z.string()
    .min(10, "Description must be at least 10 characters long to provide enough context")
    .trim(),
    
  category: z.enum(["infrastructure", "policy", "community", "other"], {
    errorMap: () => ({ message: "Category must be one of: infrastructure, policy, community, other" })
  }),
  
  constituency: z.string()
    .min(2, "Constituency is required")
    .trim(),
    
  phoneNumber: z.string()
    .regex(/^\d{10,15}$/, "Phone number must contain between 10 and 15 digits"),
    
  village: z.string()
    .min(2, "Village name must be at least 2 characters")
    .trim()
});

/**
 * Zod Schema for Suggestion Updating (Status Updates)
 */
export const updateSuggestionStatusSchema = z.object({
  status: z.enum(["submitted", "under_review", "implemented", "rejected"], {
    errorMap: () => ({ message: "Invalid status provided" })
  })
});
