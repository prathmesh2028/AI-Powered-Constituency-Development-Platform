"use client";

import { useState, useEffect } from "react";
import { Sparkles, MapPin, User, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  className?: string;
}

export const CONSTITUENCIES = [
  { value: "Baramati Constituency", label: "🏛️ Baramati Constituency" },
  { value: "Mumbai North Constituency", label: "⚓ Mumbai North Constituency" },
  { value: "Bangalore South Constituency", label: "⚡ Bangalore South Constituency" },
];

export function Navbar({ className }: NavbarProps) {
  const [constituency, setConstituency] = useState("Baramati Constituency");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load and sync constituency from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency");
    const validValues = CONSTITUENCIES.map((c) => c.value);
    
    if (saved && validValues.includes(saved)) {
      setConstituency(saved);
    } else {
      localStorage.setItem("selected_constituency", "Baramati Constituency");
      setConstituency("Baramati Constituency");
      // Trigger update event to notify listening hooks
      window.dispatchEvent(new Event("selected_constituency_changed"));
    }

    // Custom event listener to react to changes in other components
    const handleStorageChange = () => {
      const current = localStorage.getItem("selected_constituency") || "Baramati Constituency";
      setConstituency(current);
    };

    window.addEventListener("selected_constituency_changed", handleStorageChange);
    return () => {
      window.removeEventListener("selected_constituency_changed", handleStorageChange);
    };
  }, []);

  const selectConstituency = (value: string) => {
    localStorage.setItem("selected_constituency", value);
    setConstituency(value);
    setIsDropdownOpen(false);
    // Dispatch custom event to notify all listening components
    window.dispatchEvent(new Event("selected_constituency_changed"));
  };

  const getLabel = (val: string) => {
    return CONSTITUENCIES.find((c) => c.value === val)?.label || val;
  };

  return (
    <header
      className={cn(
        "glass-panel border-b border-white/5 h-16 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md",
        className
      )}
    >
      {/* Search / Context info */}
      <div className="flex items-center space-x-4">
        <MapPin className="h-4.5 w-4.5 text-slate-400 hidden sm:block" />
        
        {/* Custom Constituency Select Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-slate-50 bg-slate-900 px-3.5 py-2 rounded border border-slate-800 transition-all cursor-pointer h-9 shadow-sm"
          >
            <span>{getLabel(constituency)}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                onClick={() => setIsDropdownOpen(false)}
                className="fixed inset-0 z-10"
              />
              <div className="absolute top-10 left-0 w-64 bg-slate-900 rounded border border-slate-800 shadow-md py-1 z-20">
                {CONSTITUENCIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => selectConstituency(c.value)}
                    className={cn(
                      "w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors flex items-center justify-between border-l-2 cursor-pointer",
                      constituency === c.value 
                        ? "text-active-text bg-active-bg border-primary-500" 
                        : "text-slate-450 hover:bg-slate-800 hover:text-slate-200 border-transparent"
                    )}
                  >
                    <span>{c.label}</span>
                    {constituency === c.value && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Actions & Role Indicator */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Connection status */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-emerald-400 font-medium bg-emerald-950/20 border border-emerald-500/25 px-2.5 py-1 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>API Connected</span>
        </div>

        {/* Representative Info */}
        <div className="flex items-center space-x-3 bg-slate-900/40 border border-white/5 p-1.5 pr-3.5 rounded-full">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-bold text-slate-200 leading-none">Hon. MP Rajesh Kumar</p>
            <span className="text-[9px] text-slate-400 font-semibold uppercase leading-none">
              Representative
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
