import { z } from "zod";

export const createRepresentativeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("representative").default("representative"),
  constituency: z.string().min(1, "Constituency is required"),
  party: z.string().optional(),
});
