import { z } from "zod";

export const createIssueSchema = z.object({
  citizenId: z.string().min(1, "Citizen ID is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters to enable AI analysis"),
  category: z.enum(["infrastructure", "sanitation", "utilities", "education", "health", "other"], {
    errorMap: () => ({ message: "Invalid category selected" }),
  }),
  constituency: z.string().min(1, "Constituency is required"),
  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z.array(z.number()).length(2, "Coordinates must be [longitude, latitude]"),
    address: z.string().optional(),
  }),
  mediaUrls: z.array(z.string().url()).optional(),
});
