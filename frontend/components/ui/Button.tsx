"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "type" | "children"> {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "ai";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-sm",
      secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100",
      outline: "border border-slate-700 hover:bg-slate-800/50 text-slate-200",
      ghost: "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200",
      ai: "bg-gradient-to-r from-primary-600 via-ai-violet to-ai-purple hover:opacity-90 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)] border border-white/10",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4.5 py-2.5 text-sm",
      lg: "px-6 py-3.5 text-base",
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        whileHover={disabled || loading ? undefined : { scale: 1.01 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
