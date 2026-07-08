import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "ai";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border";
  
  const variants = {
    default: "bg-slate-900 border-slate-800 text-slate-400",
    primary: "bg-active-bg border-active-border text-active-text",
    secondary: "bg-slate-800 border-slate-700/50 text-slate-350",
    success: "bg-emerald-badge-bg border-emerald-badge-text/15 text-emerald-badge-text",
    warning: "bg-amber-badge-bg border-amber-badge-text/15 text-amber-badge-text",
    error: "bg-rose-badge-bg border-rose-badge-text/15 text-rose-badge-text",
    ai: "bg-indigo-badge-bg border-indigo-badge-text/15 text-indigo-badge-text shadow-sm",
  };

  return <span className={cn(baseStyles, variants[variant], className)} {...props} />;
}

// Specialized Badges
export function StatusChip({ status }: { status: string }) {
  switch (status) {
    case "submitted":
      return <Badge variant="secondary">Submitted</Badge>;
    case "under_review":
      return <Badge variant="warning">Under Review</Badge>;
    case "implemented":
    case "actioned":
    case "resolved":
      return <Badge variant="success">Implemented</Badge>;
    case "rejected":
      return <Badge variant="error">Rejected</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export function CategoryChip({ category }: { category: string }) {
  switch (category) {
    case "infrastructure":
      return <Badge variant="primary">Infrastructure</Badge>;
    case "policy":
      return <Badge variant="ai">Policy</Badge>;
    case "community":
      return <Badge className="bg-teal-badge-bg border-teal-badge-text/15 text-teal-badge-text">Community</Badge>;
    default:
      return <Badge variant="default">{category || "Other"}</Badge>;
  }
}

export function PriorityBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <Badge variant="default">Pending AI</Badge>;
  }
  
  if (score >= 8) {
    return <Badge variant="error" className="animate-pulse">Priority {score}/10</Badge>;
  } else if (score >= 5) {
    return <Badge variant="warning">Priority {score}/10</Badge>;
  } else {
    return <Badge variant="primary">Priority {score}/10</Badge>;
  }
}
