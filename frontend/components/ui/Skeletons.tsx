import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/60", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3.5 w-3/5" />
      <div className="pt-2">
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden space-y-4 p-6">
      <div className="flex justify-between items-center pb-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-3">
        {/* Header Skeleton */}
        <div className="flex space-x-4 border-b border-white/5 pb-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* Rows Skeleton */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 py-2">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-panel rounded-xl p-6 flex flex-col space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      ))}
    </div>
  );
}
