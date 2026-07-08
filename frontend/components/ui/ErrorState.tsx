"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error loading the data. Please check your connection and try again.",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-rose-500/10 rounded-xl bg-rose-500/5 min-h-[300px]",
        className
      )}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 shadow-sm">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-200 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-5 border-rose-500/25 text-rose-300 hover:bg-rose-500/10">
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
