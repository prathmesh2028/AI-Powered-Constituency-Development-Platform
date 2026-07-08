"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-slate-900/10 min-h-[300px]",
        className
      )}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-slate-900 border border-white/5 text-slate-400 mb-4 shadow-inner">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5 bg-slate-800 border border-slate-700 hover:bg-slate-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
