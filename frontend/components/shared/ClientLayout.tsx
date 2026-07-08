"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Determine if the current route is a dashboard route
  const isDashboardRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/analytics") || 
    pathname.startsWith("/recommendations");

  if (isDashboardRoute) {
    return (
      <div className="flex">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content viewport */}
        <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
          {/* Top Navigation Bar */}
          <Navbar />

          {/* Main view container */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full relative z-10">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Public Layout (Landing Page, Citizen Suggestion Portal, Track page)
  return (
    <div className="min-h-screen flex flex-col">
      {/* Public Sticky Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-8.5 w-8.5 rounded bg-gradient-to-tr from-primary-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-slate-50 uppercase">
                CivicPrioritize
              </h1>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest block leading-none">
                AI constituency platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${pathname === "/" ? "text-primary-500" : "text-slate-400 hover:text-slate-50"}`}
            >
              Home
            </Link>
            <Link 
              href="/submit" 
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${pathname === "/submit" ? "text-primary-500" : "text-slate-400 hover:text-slate-50"}`}
            >
              Submit Grievance
            </Link>
            <Link 
              href="/track" 
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${pathname.startsWith("/track") ? "text-primary-500" : "text-slate-400 hover:text-slate-50"}`}
            >
              Track Status
            </Link>
          </nav>

          {/* CTA Link to MP Dashboard */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex border-slate-800 text-slate-350 hover:text-slate-50 hover:bg-slate-800">
                MP Portal
              </Button>
            </Link>
            <Link href="/submit">
              <Button variant="ai" size="sm" className="font-semibold">
                Report Issue
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 relative z-10">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded bg-gradient-to-tr from-primary-500/20 to-purple-500/20 flex items-center justify-center border border-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-primary-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400">CivicPrioritize © 2026</span>
          </div>
          <div className="flex items-center space-x-6 text-xs text-slate-500 font-semibold">
            <span>Powered by Google Gemini 2.0</span>
            <span>•</span>
            <span>National AI Hackathon Entry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
