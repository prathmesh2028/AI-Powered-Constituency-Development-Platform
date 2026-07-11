"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertTriangle,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  Flame,
  ShieldCheck
} from "lucide-react";
import dynamic from "next/dynamic";

const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface EventLog {
  time: string;
  step: number;
  congestion: number;
  waterLevel: number;
  activeIncidents: { title: string; severity: number; loc: string }[];
  decisions: { action: string; status: string; desc: string }[];
  crowdDistribution: { section: string; x: number; y: number; color: string }[];
  volunteerPos: { x: number; y: number; active: boolean };
}

// 5-Step Historical Incident logs dataset: "Stadium Monsoon Flash Flood & Evacuation"
const HISTORICAL_SCENARIO_LOGS: EventLog[] = [
  {
    time: "14:00",
    step: 0,
    congestion: 20,
    waterLevel: 5,
    activeIncidents: [],
    decisions: [],
    crowdDistribution: [
      // Section A
      { section: "A", x: 100, y: 150, color: "fill-emerald-400" },
      { section: "A", x: 110, y: 160, color: "fill-emerald-400" },
      { section: "A", x: 120, y: 140, color: "fill-emerald-400" },
      // Section B
      { section: "B", x: 200, y: 120, color: "fill-emerald-400" },
      { section: "B", x: 210, y: 130, color: "fill-emerald-400" },
      { section: "B", x: 190, y: 140, color: "fill-emerald-400" },
      // Section C
      { section: "C", x: 300, y: 150, color: "fill-emerald-400" },
      { section: "C", x: 280, y: 160, color: "fill-emerald-400" },
      { section: "C", x: 290, y: 140, color: "fill-emerald-400" },
    ],
    volunteerPos: { x: 200, y: 280, active: false }
  },
  {
    time: "14:15",
    step: 1,
    congestion: 45,
    waterLevel: 45,
    activeIncidents: [
      { title: "Water clogging at Gate 1", severity: 8, loc: "Gate 1 Drain" }
    ],
    decisions: [
      { action: "Open Gates", status: "pending", desc: "Initiating flood sluice gate release at Gate 1." }
    ],
    crowdDistribution: [
      // Sections showing panic
      { section: "A", x: 105, y: 155, color: "fill-amber-400" },
      { section: "A", x: 115, y: 165, color: "fill-amber-400" },
      { section: "A", x: 125, y: 145, color: "fill-amber-400" },
      { section: "B", x: 205, y: 125, color: "fill-amber-400" },
      { section: "B", x: 215, y: 135, color: "fill-amber-400" },
      { section: "B", x: 195, y: 145, color: "fill-amber-400" },
      { section: "C", x: 305, y: 155, color: "fill-amber-400" },
      { section: "C", x: 285, y: 165, color: "fill-amber-400" },
      { section: "C", x: 295, y: 145, color: "fill-amber-400" },
    ],
    volunteerPos: { x: 200, y: 280, active: true }
  },
  {
    time: "14:30",
    step: 2,
    congestion: 85,
    waterLevel: 80,
    activeIncidents: [
      { title: "Flooding Outbreak Gate 1", severity: 9, loc: "Gate 1 Checkpoint" },
      { title: "Bottleneck Gridlock", severity: 8, loc: "Gate 1 Exit Corridor" }
    ],
    decisions: [
      { action: "Open Gates", status: "executed", desc: "Gates 2 and 3 opened for urgent crowd redirection." },
      { action: "Close Gates", status: "executed", desc: "Gate 1 containment valve shut to prevent backflow." }
    ],
    crowdDistribution: [
      // Crowd shifting towards exits
      { section: "Gate 2 Exit", x: 80, y: 200, color: "fill-rose-500" },
      { section: "Gate 2 Exit", x: 75, y: 190, color: "fill-rose-500" },
      { section: "Gate 3 Exit", x: 320, y: 200, color: "fill-rose-500" },
      { section: "Gate 3 Exit", x: 325, y: 190, color: "fill-rose-500" },
      { section: "B", x: 205, y: 135, color: "fill-rose-500" },
      { section: "A", x: 125, y: 165, color: "fill-rose-500" },
      { section: "C", x: 285, y: 165, color: "fill-rose-500" },
    ],
    volunteerPos: { x: 140, y: 240, active: true } // moving towards Gate 1
  },
  {
    time: "14:45",
    step: 3,
    congestion: 50,
    waterLevel: 30,
    activeIncidents: [
      { title: "Flooding Outbreak Gate 1 (Clearing)", severity: 5, loc: "Gate 1 Checkpoint" }
    ],
    decisions: [
      { action: "Dispatch Volunteers", status: "executed", desc: "Civic Volunteer Corps clearing drainage silts at Gate 1." }
    ],
    crowdDistribution: [
      // Crowd leaving Gates
      { section: "Gate 2 Outside", x: 60, y: 210, color: "fill-amber-400" },
      { section: "Gate 3 Outside", x: 340, y: 210, color: "fill-amber-400" },
      { section: "Gate 2 Exit", x: 80, y: 200, color: "fill-amber-400" },
      { section: "Gate 3 Exit", x: 320, y: 200, color: "fill-amber-400" },
    ],
    volunteerPos: { x: 80, y: 100, active: true } // Arrived at Gate 1 drain hotspot
  },
  {
    time: "15:00",
    step: 4,
    congestion: 5,
    waterLevel: 5,
    activeIncidents: [],
    decisions: [
      { action: "Dispatch Volunteers", status: "executed", desc: "Cleanup complete. Drain clear. Telemetry normal." }
    ],
    crowdDistribution: [
      // Stadium completely evacuated
      { section: "Evacuated", x: 50, y: 220, color: "fill-emerald-400" },
      { section: "Evacuated", x: 350, y: 220, color: "fill-emerald-400" },
    ],
    volunteerPos: { x: 80, y: 100, active: false }
  }
];

export default function ScenarioReplayPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1); // Step tick multiplier
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Core Playback triggers
  useEffect(() => {
    if (isPlaying) {
      const delay = playbackSpeed === 1 ? 3000 : playbackSpeed === 2 ? 1500 : 700;
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= HISTORICAL_SCENARIO_LOGS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const activeLog = HISTORICAL_SCENARIO_LOGS[currentStep];

  const handleRewind = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Recharts synchronized chart dataset formatting
  const chartData = HISTORICAL_SCENARIO_LOGS.map(log => ({
    time: log.time,
    congestion: log.congestion,
    waterLevel: log.waterLevel,
    // Highlight step
    active: log.step <= currentStep ? log.congestion : null
  }));

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary-500" />
            Evacuation Scenario Replay
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Visual reconstruction of stadium state and deterministic mitigations from historical logs
          </p>
        </div>
      </div>

      {/* Replay Playback Controllers Panel */}
      <Card className="border border-slate-850 bg-slate-900 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <Button
            variant="primary"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-10 w-24 font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4.5 w-4.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5" /> Play
              </>
            )}
          </Button>

          {/* Rewind */}
          <Button
            variant="outline"
            onClick={handleRewind}
            className="h-10 border-slate-800 text-slate-300 hover:text-slate-50 font-bold px-3.5 cursor-pointer bg-transparent"
          >
            <RotateCcw className="h-4.5 w-4.5 mr-1" /> Rewind
          </Button>

          {/* Playback speed */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
            {([1, 2, 5] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  playbackSpeed === speed
                    ? "bg-primary-650 text-white"
                    : "bg-transparent text-slate-500 hover:text-slate-350"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 max-w-lg flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="font-mono">{activeLog.time}</span>
          <input
            type="range"
            min={0}
            max={HISTORICAL_SCENARIO_LOGS.length - 1}
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(parseInt(e.target.value, 10));
            }}
            className="flex-1 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <span className="font-mono">15:00</span>
        </div>
      </Card>

      {/* Grid: SVG Stadium Animator and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Stadium Layout Area */}
        <Card className="border border-slate-800 bg-slate-900 overflow-hidden lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-850 pb-3 px-5">
            <CardTitle className="text-sm font-bold text-slate-50">Borivali Stadium Evacuation Matrix</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">Live animated SVG viewport tracing crowd flows and volunteer routing pathways</CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 bg-slate-950/20 h-[380px] flex items-center justify-center relative">
            
            {/* SVG Visual stadium */}
            <svg width="400" height="340" className="w-full max-w-md h-full">
              {/* Stadium perimeter outline */}
              <circle cx="200" cy="170" r="140" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle cx="200" cy="170" r="140" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />
              
              {/* Section indicators */}
              <text x="90" y="110" className="text-[10px] fill-slate-600 font-extrabold uppercase font-mono">Sec A</text>
              <text x="185" y="80" className="text-[10px] fill-slate-600 font-extrabold uppercase font-mono">Sec B</text>
              <text x="285" y="110" className="text-[10px] fill-slate-600 font-extrabold uppercase font-mono">Sec C</text>

              {/* HQ Base */}
              <circle cx="200" cy="280" r="8" className="fill-blue-950/30 stroke-blue-500/50 stroke-1" />
              <text x="185" y="305" className="text-[8px] fill-blue-400 font-extrabold uppercase font-mono">HQ Base</text>

              {/* Gates labels and open/close light indicator */}
              {/* Gate 1 (Top Left) */}
              <rect x="70" y="90" width="20" height="12" rx="2" className={`stroke-1 ${
                currentStep >= 2 ? "fill-rose-950/20 stroke-rose-500/40" : "fill-slate-900 stroke-slate-800"
              }`} />
              <circle cx="80" cy="96" r="3" className={`${currentStep >= 2 ? "fill-rose-500" : "fill-slate-650"}`} />
              <text x="45" y="85" className="text-[8px] fill-slate-500 font-extrabold uppercase font-mono">Gate 1 (Drain)</text>

              {/* Gate 2 (Bottom Left) */}
              <rect x="50" y="190" width="20" height="12" rx="2" className={`stroke-1 ${
                currentStep >= 2 ? "fill-emerald-950/20 stroke-emerald-500/40" : "fill-slate-900 stroke-slate-800"
              }`} />
              <circle cx="60" cy="196" r="3" className={`${currentStep >= 2 ? "fill-emerald-500 animate-pulse" : "fill-slate-650"}`} />
              <text x="20" y="215" className="text-[8px] fill-slate-500 font-extrabold uppercase font-mono">Gate 2 Exit</text>

              {/* Gate 3 (Bottom Right) */}
              <rect x="330" y="190" width="20" height="12" rx="2" className={`stroke-1 ${
                currentStep >= 2 ? "fill-emerald-950/20 stroke-emerald-500/40" : "fill-slate-900 stroke-slate-800"
              }`} />
              <circle cx="340" cy="196" r="3" className={`${currentStep >= 2 ? "fill-emerald-500 animate-pulse" : "fill-slate-650"}`} />
              <text x="330" y="215" className="text-[8px] fill-slate-500 font-extrabold uppercase font-mono">Gate 3 Exit</text>

              {/* Volunteer route line path (HQ -> Gate 1) */}
              {activeLog.volunteerPos.active && (
                <path d="M 200 280 L 140 240 L 80 100" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" className="opacity-40" />
              )}

              {/* Render Crowd dots distribution */}
              {activeLog.crowdDistribution.map((dot, i) => (
                <circle
                  key={i}
                  cx={dot.x}
                  cy={dot.y}
                  r="5.5"
                  className={`${dot.color} transition-all duration-700 ease-in-out shadow-sm stroke-slate-950 stroke-0.5`}
                />
              ))}

              {/* Render Volunteer Dot */}
              {activeLog.volunteerPos.active && (
                <circle
                  cx={activeLog.volunteerPos.x}
                  cy={activeLog.volunteerPos.y}
                  r="7.5"
                  className="fill-indigo-500 stroke-indigo-400 stroke-1 animate-pulse"
                />
              )}
            </svg>

            {/* Rain simulation overlay */}
            {currentStep >= 1 && currentStep <= 3 && (
              <div className="absolute inset-0 bg-blue-950/5 pointer-events-none overflow-hidden flex flex-wrap gap-2 opacity-25">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="h-4 w-[1px] bg-blue-400 rotate-12 animate-rainDown" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Recharts and Alert feeds */}
        <div className="lg:col-span-1 space-y-6">
          {/* Synchronized Recharts */}
          <Card className="border border-slate-800 bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-4 border-b border-slate-850">
              <CardTitle className="text-sm font-bold text-slate-50 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary-500" />
                Playback Telemetry Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} labelStyle={{ color: "#94a3b8" }} />
                  <Line type="monotone" dataKey="congestion" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} name="Congestion %" />
                  <Line type="monotone" dataKey="waterLevel" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Water Level (mm)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Incidents and Decisions Overlay list */}
          <Card className="border border-slate-800 bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-4 border-b border-slate-850">
              <CardTitle className="text-sm font-bold text-slate-50 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary-500" />
                Event log Overlay
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[220px] overflow-y-auto">
              {/* Active Incident Warning cards */}
              {activeLog.activeIncidents.map((inc, i) => (
                <div key={i} className="p-2.5 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">{inc.title}</h5>
                    <p className="text-[10px] text-rose-500/80 font-normal">Location: {inc.loc} • Severity: {inc.severity}/10</p>
                  </div>
                </div>
              ))}

              {/* Decisive Actions generated */}
              {activeLog.decisions.map((dec, i) => (
                <div key={i} className="p-2.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold flex items-start gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Mitigation Executed: [{dec.action}]</h5>
                    <p className="text-[10px] text-emerald-500/80 font-normal">{dec.desc}</p>
                  </div>
                </div>
              ))}

              {activeLog.activeIncidents.length === 0 && activeLog.decisions.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                  No active incidents or matrix operations registered.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
