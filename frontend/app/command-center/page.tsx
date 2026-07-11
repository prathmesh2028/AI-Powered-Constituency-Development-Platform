"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusChip, CategoryChip } from "@/components/ui/Badge";
import { api, Suggestion, Decision } from "@/lib/api/client";
import { CONSTITUENCY_GEOGRAPHY } from "@/constants";
import dynamic from "next/dynamic";
import {
  Activity,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  GitFork,
  Radio,
  ExternalLink,
  Users,
  Compass,
  FileSpreadsheet,
  TrendingUp,
  Brain,
  Sliders
} from "lucide-react";
import Link from "next/link";

const CategoryPieChart = dynamic(
  () => import("@/components/shared/DashboardCharts").then((mod) => mod.CategoryPieChart),
  { ssr: false }
);

const LeafletMap = dynamic(
  () => import("@/components/shared/LeafletMap"),
  { ssr: false }
);

interface TimelineEvent {
  id: string;
  time: string;
  text: string;
  type: "info" | "decision" | "alert" | "success";
}

export default function CommandCenterPage() {
  const [constituency, setConstituency] = useState("Baramati Constituency");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live WebSocket Connection Status
  const [isConnected, setIsConnected] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency") || "Baramati Constituency";
    const valid = ["Baramati Constituency", "Mumbai North Constituency", "Bangalore South Constituency"];
    const activeConst = valid.includes(saved) ? saved : "Baramati Constituency";
    setConstituency(activeConst);
    fetchData(activeConst);

    const handleStorageChange = () => {
      const current = localStorage.getItem("selected_constituency") || "Baramati Constituency";
      const activeCurrent = valid.includes(current) ? current : "Baramati Constituency";
      setConstituency(activeCurrent);
      fetchData(activeCurrent);
    };

    window.addEventListener("selected_constituency_changed", handleStorageChange);
    return () => {
      window.removeEventListener("selected_constituency_changed", handleStorageChange);
    };
  }, []);

  // WebSocket Live Sync Integration
  useEffect(() => {
    // Determine WebSocket protocol based on browser URL
    const isHttps = window.location.protocol === "https:";
    const host = window.location.hostname === "localhost" ? "localhost:5000" : window.location.host;
    const wsProto = isHttps ? "wss:" : "ws:";
    
    // Fallback to local server if host doesn't represent backend service
    const finalHost = host.includes("localhost") || host.includes("127.0.0.1") ? "localhost:5000" : host;
    const wsUrl = `${wsProto}//${finalHost}`;
    
    console.log(`🔌 Connecting to Live Command WebSocket at: ${wsUrl}`);
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log("✅ Live Command Center WebSocket Connected");
        addTimelineEvent("Established WebSocket real-time telemetry node.", "success");
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          
          if (parsed.type === "WELCOME") {
            console.log("Welcome message:", parsed.message);
          } else if (parsed.type === "NEW_SUGGESTION") {
            const newSug = parsed.data;
            if (newSug.constituency === constituency) {
              setSuggestions(prev => [newSug, ...prev].slice(0, 15));
              addTimelineEvent(`Citizen report logged: "${newSug.title}" in ${newSug.village}`, "alert");
              // Retrigger data poll for live metric updates
              fetchData(constituency, true);
            }
          } else if (parsed.type === "SUGGESTION_UPDATE") {
            const updSug = parsed.data;
            if (updSug.constituency === constituency) {
              setSuggestions(prev => prev.map(s => s._id === updSug._id ? updSug : s));
              addTimelineEvent(`Citizen status updated to "${updSug.status}": "${updSug.title}"`, "info");
              fetchData(constituency, true);
            }
          } else if (parsed.type === "NEW_DECISION") {
            const newDec = parsed.data;
            if (newDec.constituency === constituency) {
              setDecisions(prev => [newDec, ...prev].slice(0, 15));
              addTimelineEvent(`Decision mitigation logged: [${newDec.action}]`, "decision");
              fetchData(constituency, true);
            }
          } else if (parsed.type === "DECISION_UPDATE") {
            const updDec = parsed.data;
            if (updDec.constituency === constituency) {
              setDecisions(prev => prev.map(d => d._id === updDec._id ? updDec : d));
              addTimelineEvent(`Mitigation [${updDec.action}] marked: "${updDec.status}"`, "success");
              fetchData(constituency, true);
            }
          }
        } catch (e) {
          console.warn("WebSocket parse error:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.warn("⚠️ WebSocket connection closed.");
      };

      ws.onerror = (err) => {
        console.error("WebSocket transport error:", err);
      };
    } catch (wsErr) {
      console.warn("WebSocket setup failed:", wsErr);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [constituency]);

  const addTimelineEvent = (text: string, type: TimelineEvent["type"] = "info") => {
    const time = new Date().toLocaleTimeString();
    const event: TimelineEvent = {
      id: `timeline-${Date.now()}-${Math.random()}`,
      time,
      text,
      type
    };
    setTimeline(prev => [event, ...prev].slice(0, 10));
  };

  const fetchData = async (constName: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      // 1. Fetch suggestions
      const sugData = await api.suggestions.list({ constituency: constName, limit: 15 });
      setSuggestions(sugData.data || []);

      // 2. Fetch decisions
      const decData = await api.decisions.list({ constituency: constName });
      setDecisions(decData || []);

      // Initial timeline log population if timeline is empty
      if (timeline.length === 0) {
        const events: TimelineEvent[] = [];
        if (decData && decData.length > 0) {
          decData.slice(0, 3).forEach((d, i) => {
            events.push({
              id: `init-dec-${i}`,
              time: new Date(d.createdAt).toLocaleTimeString(),
              text: `Mitigation [${d.action}] registered as ${d.status}.`,
              type: d.status === "executed" ? "success" : "decision"
            });
          });
        }
        if (sugData.data && sugData.data.length > 0) {
          sugData.data.slice(0, 2).forEach((s, i) => {
            events.push({
              id: `init-sug-${i}`,
              time: new Date(s.createdAt).toLocaleTimeString(),
              text: `Incident reported: "${s.title}" in ${s.village}.`,
              type: "alert"
            });
          });
        }
        setTimeline(events);
      }
    } catch (err: any) {
      console.warn("Failed to synchronize Command Center telemetry:", err);
      setError("Failed to sync live data from the backend cluster.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleUpdateDecision = async (id: string, newStatus: Decision["status"]) => {
    setActioningId(id);
    try {
      await api.decisions.updateStatus(id, newStatus);
      await fetchData(constituency, true);
    } catch (err) {
      setError("Failed to execute action on backend. Please retry.");
    } finally {
      setActioningId(null);
    }
  };

  // KPIs Calculations
  const totalReports = suggestions.length;
  const pendingIncidents = suggestions.filter(s => ["submitted", "under_review"].includes(s.status)).length;
  const highPriorityCount = suggestions.filter(s => 
    ["submitted", "under_review"].includes(s.status) && (s.priorityScore || 0) >= 8
  ).length;

  const totalDecisions = decisions.length;
  const executedDecisions = decisions.filter(d => d.status === "executed").length;
  const resolutionRate = totalDecisions > 0 ? Math.round((executedDecisions / totalDecisions) * 100) : 100;

  // Dynamically compute Health Score out of 100
  // Formula: 100 - (High Priority Pending * 5) - (Other Pending * 0.5)
  const healthReduction = (highPriorityCount * 6) + ((pendingIncidents - highPriorityCount) * 0.4);
  const healthScore = Math.max(10, Math.min(100, Math.round(100 - healthReduction)));

  // Health Rating Text & Color
  const getHealthLevel = (score: number) => {
    if (score >= 85) return { label: "Optimal Status", color: "text-emerald-400" };
    if (score >= 65) return { label: "Moderate Risk", color: "text-amber-400" };
    return { label: "Critical Attention Needed", color: "text-rose-400" };
  };
  const healthLevel = getHealthLevel(healthScore);

  // Predictions Engine Logic (Dynamic alerts)
  const getPredictiveWarnings = () => {
    const warnings = [];
    const waterGrievances = suggestions.filter(s => /water|pipeline|contamination|sewage/i.test(s.title + s.description));
    const floodGrievances = suggestions.filter(s => /flood|rain|water logging|drain/i.test(s.title + s.description));
    const trafficGrievances = suggestions.filter(s => /traffic|road|pothole|hawker/i.test(s.title + s.description));

    if (waterGrievances.length >= 2) {
      warnings.push({
        id: "pred-water",
        title: "Sanitation Quality Warning: Critical Risk",
        desc: `High probability of water-borne hazard in sector sectors. Clogged drains and silt pipelines run high.`,
        source: `${waterGrievances.length} recent contamination reports`,
        severity: "critical"
      });
    }
    if (floodGrievances.length >= 2) {
      warnings.push({
        id: "pred-flood",
        title: "Monsoon Flood Warning: High Risk",
        desc: `Localized street flooding expected during next heavy showers due to clogged drainage mains.`,
        source: `${floodGrievances.length} active drainage complaints`,
        severity: "high"
      });
    }
    if (trafficGrievances.length >= 2) {
      warnings.push({
        id: "pred-traffic",
        title: "Transit Gridlock Alert: Moderate Risk",
        desc: `Extreme peak hour bottlenecking predicted near local marketplaces and stations. hawkers obstruction high.`,
        source: `${trafficGrievances.length} road block logs`,
        severity: "moderate"
      });
    }

    // Default warning if database has few seed items
    if (warnings.length === 0) {
      warnings.push({
        id: "pred-default",
        title: "Infrastructure Degradation Warning",
        desc: "Highway potholes and state road asphalt disintegration risk minor motor collisions in the upcoming week.",
        source: "Aggregated reports and winter climate forecasts",
        severity: "moderate"
      });
    }

    return warnings;
  };

  const predictions = getPredictiveWarnings();

  // Recharts Pie Chart Data helper
  const getChartData = () => {
    const counts: Record<string, number> = {};
    suggestions.forEach(s => {
      const cat = s.category || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: counts[key]
    }));
  };

  // Heatmap Marker formatting
  const geo = CONSTITUENCY_GEOGRAPHY[constituency] || CONSTITUENCY_GEOGRAPHY["Baramati Constituency"];
  const markers = suggestions.map((s, index) => {
    let lat = geo.center[0];
    let lng = geo.center[1];

    if (geo.villages[s.village]) {
      lat = geo.villages[s.village].lat;
      lng = geo.villages[s.village].lng;
    } else {
      let hash = 0;
      for (let i = 0; i < (s.village || "").length; i++) {
        hash = (s.village || "").charCodeAt(i) + ((hash << 5) - hash);
      }
      const latOffset = ((hash % 100) / 4500) + (index * 0.0025 - 0.005);
      const lngOffset = (((hash >> 8) % 100) / 4500) + (index * -0.0025 + 0.005);
      lat += latOffset;
      lng += lngOffset;
    }

    return {
      id: s._id,
      lat,
      lng,
      village: s.village || "Unknown",
      title: s.title,
      category: s.category || "other",
      priorityScore: s.priorityScore || 5,
      status: s.status
    };
  });

  return (
    <div className="space-y-6 py-2">
      {/* Live Header Monitor */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <Radio className={`h-5 w-5 ${isConnected ? "text-emerald-500 animate-pulse" : "text-slate-600"}`} />
            Mission Command Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-ping" : "bg-slate-600"}`} />
            {isConnected ? "Real-Time WebSocket Feed Active" : "Disconnected - Operating in Polling Fallback Mode"}
            <span>•</span> Live telemetry context for <strong className="text-slate-350 font-semibold">{constituency}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(constituency)}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-50 font-semibold h-9 px-3"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-sync Node
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-badge-bg border border-rose-badge-text/15 text-rose-badge-text text-xs font-semibold flex items-center gap-2 rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. KPI Cards and Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dynamic Health Score Card */}
        <Card className="border border-slate-800 bg-slate-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 -mr-4 -mt-4 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full" />
          <CardHeader className="pb-2 pt-4 px-5">
            <CardDescription className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-primary-500" /> Constituency Health Index
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-50 font-mono tracking-tight">{healthScore}</span>
              <span className="text-xs text-slate-500 font-bold">/ 100</span>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${healthLevel.color}`}>
              {healthLevel.label}
            </p>
          </CardContent>
        </Card>

        {/* Active Incidents */}
        <Card className="border border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardDescription className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Urgent Incidents
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-1">
            <span className="text-3xl font-extrabold text-slate-50 font-mono tracking-tight">{highPriorityCount}</span>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">
              Severity ≥ 8 pending reviews
            </p>
          </CardContent>
        </Card>

        {/* Total Mitigation Actions */}
        <Card className="border border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardDescription className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5 text-teal-400" /> Mitigations Logged
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-1">
            <span className="text-3xl font-extrabold text-slate-50 font-mono tracking-tight">{totalDecisions}</span>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">
              Generated by Rule Engine
            </p>
          </CardContent>
        </Card>

        {/* Action Resolution Rate */}
        <Card className="border border-slate-800 bg-slate-900 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardDescription className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Decision Resolution
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-50 font-mono tracking-tight">{resolutionRate}</span>
              <span className="text-xs text-slate-500 font-bold">%</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">
              Logged mitigations executed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Maps and Chart Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid Panel */}
        <Card className="border border-slate-800 bg-slate-900 overflow-hidden lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-850 pb-3 px-5">
            <CardTitle className="text-sm font-bold text-slate-50">Geospatial Hotspot Matrix</CardTitle>
            <CardDescription className="text-[11px] text-slate-500 font-normal">Interactive heatmap depicting geographic density and severity distributions</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-80">
            {!loading ? (
              <LeafletMap markers={markers} center={geo.center} zoom={geo.zoom} />
            ) : (
              <div className="w-full h-full bg-slate-950/20 animate-pulse" />
            )}
          </CardContent>
        </Card>

        {/* Categories breakdown Recharts panel */}
        <Card className="border border-slate-800 bg-slate-900 shadow-sm lg:col-span-1">
          <CardHeader className="border-b border-slate-850 pb-3 px-5">
            <CardTitle className="text-sm font-bold text-slate-50">Incident Categories</CardTitle>
            <CardDescription className="text-[11px] text-slate-500 font-normal">Grievance distribution ratios</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center p-4">
            {!loading && getChartData().length > 0 ? (
              <CategoryPieChart data={getChartData()} colors={["#2563eb", "#7c3aed", "#10b981", "#64748b"]} />
            ) : (
              <span className="text-xs text-slate-500 font-semibold">Gathering telemetry metrics...</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Predictive Warnings Alert Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Brain className="h-4 w-4 text-primary-500 animate-pulse" /> AI Predictive Diagnostic Alerts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.map((p) => (
            <Card
              key={p.id}
              className={`border bg-slate-950/40 relative overflow-hidden ${
                p.severity === "critical"
                  ? "border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.1)]"
                  : p.severity === "high"
                  ? "border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.1)]"
                  : "border-slate-800/80"
              }`}
            >
              {/* Highlight indicator line */}
              <div className={`absolute left-0 inset-y-0 w-1 ${
                p.severity === "critical" ? "bg-red-500" : p.severity === "high" ? "bg-amber-500" : "bg-blue-500"
              }`} />
              
              <CardContent className="p-4 pl-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.2 text-[8px] font-extrabold uppercase border ${
                    p.severity === "critical"
                      ? "bg-red-500/10 border-red-500/25 text-red-400"
                      : p.severity === "high"
                      ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                      : "bg-blue-500/10 border-blue-500/25 text-blue-400"
                  }`}>
                    {p.severity} Priority Alert
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide font-mono">Telemetry Trigger</span>
                </div>
                <h4 className="font-bold text-slate-200 text-xs sm:text-[13px] tracking-tight">{p.title}</h4>
                <p className="text-slate-400 font-normal leading-relaxed">{p.desc}</p>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Source: <strong className="text-slate-400 font-bold">{p.source}</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Decision Actions Matrix and Timeline split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Decision Recommendations */}
        <div className="lg:col-span-2 space-y-3.5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-primary-500" /> Active Mitigation Directives
          </h2>
          <Card className="border border-slate-800 bg-slate-900">
            <CardHeader className="border-b border-slate-850 py-3 px-5">
              <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider">Awaiting Executive Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-850 max-h-[380px] overflow-y-auto">
              {!loading && decisions.filter(d => d.status === "pending").length > 0 ? (
                decisions.filter(d => d.status === "pending").map((d) => (
                  <div key={d._id} className="p-4 hover:bg-slate-950/20 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.2 rounded uppercase">
                          {d.action}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold font-mono">
                          ETA: {d.eta}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-200 leading-tight">{d.decision}</h4>
                      <p className="text-[11px] text-slate-450 font-normal leading-relaxed">{d.reason}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actioningId === d._id}
                        onClick={() => handleUpdateDecision(d._id, "cancelled")}
                        className="h-8 text-[11px] font-bold text-slate-400 hover:text-slate-250 border border-slate-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={actioningId === d._id}
                        onClick={() => handleUpdateDecision(d._id, "executed")}
                        className="h-8 text-[11px] font-bold"
                      >
                        Execute
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                  No pending decision matrix entries queued.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline Event log */}
        <div className="lg:col-span-1 space-y-3.5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary-500 animate-pulse" /> Telemetry Timeline Logs
          </h2>
          <Card className="border border-slate-800 bg-slate-900">
            <CardHeader className="border-b border-slate-850 py-3 px-5">
              <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chronological Node Log</CardTitle>
            </CardHeader>
            <CardContent className="p-5 h-[340px] overflow-y-auto">
              <div className="relative border-l border-slate-800 pl-4 space-y-4">
                {timeline.map((event) => {
                  let dotColor = "bg-slate-700";
                  if (event.type === "alert") dotColor = "bg-rose-500 animate-pulse";
                  if (event.type === "decision") dotColor = "bg-primary-500";
                  if (event.type === "success") dotColor = "bg-emerald-500";

                  return (
                    <div key={event.id} className="relative text-xs">
                      {/* Timeline point */}
                      <span className={`absolute -left-[20px] top-1 h-2.5 w-2.5 rounded-full border border-slate-900 ${dotColor}`} />
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 font-mono">
                        <span>Event Node</span>
                        <span>{event.time}</span>
                      </div>
                      <p className="text-slate-300 leading-normal font-normal">{event.text}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
