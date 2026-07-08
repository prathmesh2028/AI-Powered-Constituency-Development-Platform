"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: string; // Tailwind color class prefix (e.g., 'primary', 'amber', 'emerald', 'rose')
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accentColor = "primary",
  className
}: StatCardProps) {
  const borderColors = {
    primary: "hover:border-primary-500/35",
    amber: "hover:border-amber-500/35",
    emerald: "hover:border-emerald-500/35",
    rose: "hover:border-rose-500/35",
    violet: "hover:border-indigo-500/35"
  };

  const bgGlows = {
    primary: "group-hover:bg-primary-500/10 text-primary-500 border-primary-500/20",
    amber: "group-hover:bg-amber-500/10 text-amber-500 border-amber-500/20",
    emerald: "group-hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rose: "group-hover:bg-rose-500/10 text-rose-500 border-rose-500/20",
    violet: "group-hover:bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  };

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-200 hover:-translate-y-0.5 border border-slate-800", 
        borderColors[accentColor as keyof typeof borderColors] || borderColors.primary,
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div 
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded bg-slate-950 border border-slate-800 transition-colors duration-200", 
              bgGlows[accentColor as keyof typeof bgGlows] || bgGlows.primary
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-50">{value}</span>
          {trend && (
            <span 
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", 
                trend.isPositive 
                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-500" 
                  : "bg-rose-950/20 border-rose-500/20 text-rose-500"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-2 text-xs text-slate-400 leading-normal font-normal">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
