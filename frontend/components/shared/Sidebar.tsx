"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Search,
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Submit Suggestion", href: "/submit", icon: FileText },
    { name: "Track Status", href: "/track", icon: Search },
    { name: "MP Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "AI Recommendations", href: "/recommendations", icon: BrainCircuit, badge: "Gemini 2.0" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4.5 left-4.5 z-50 p-2.5 rounded-lg glass-panel text-slate-300 md:hidden hover:text-white"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col flex-1 pt-6 px-4">
          {/* Logo / Brand Header */}
          <div className="flex items-center space-x-3 px-3.5 pb-6 border-b border-slate-800">
            <div className="h-8.5 w-8.5 rounded bg-gradient-to-tr from-primary-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-slate-50 uppercase">
                CivicPrioritize
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                AI Powered
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex-1 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-semibold transition-all border",
                    isActive
                      ? "bg-active-bg text-active-text border-active-border"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-800/60 border-transparent"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-105",
                        isActive ? "text-active-text" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[8px] font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Demo Notes */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="rounded bg-slate-950/40 p-3 border border-slate-850">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
              MP Constituency Board
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
