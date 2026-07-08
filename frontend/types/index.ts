import { Suggestion, User, DashboardStats, AISuggestionAnalysis, AISentimentResult } from "@/lib/api/client";

export type StatusType = "submitted" | "under_review" | "implemented" | "rejected";
export type CategoryType = "infrastructure" | "policy" | "community" | "other";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface StepProps {
  formData: any;
  updateFields: (fields: Partial<any>) => void;
  next: () => void;
  prev: () => void;
  isFirst: boolean;
  isLast: boolean;
}
