"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, Decision } from "@/lib/api/client";
import {
  Sliders,
  RefreshCw,
  Users,
  Unlock,
  Lock,
  Megaphone,
  Activity,
  Shuffle,
  Compass,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function DecisionsPage() {
  const [constituency, setConstituency] = useState("Baramati Constituency");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "executed" | "cancelled">("all");
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency") || "Baramati Constituency";
    const valid = ["Baramati Constituency", "Mumbai North Constituency", "Bangalore South Constituency"];
    const activeConst = valid.includes(saved) ? saved : "Baramati Constituency";
    setConstituency(activeConst);
    fetchDecisions(activeConst);

    const handleStorageChange = () => {
      const current = localStorage.getItem("selected_constituency") || "Baramati Constituency";
      const activeCurrent = valid.includes(current) ? current : "Baramati Constituency";
      setConstituency(activeCurrent);
      fetchDecisions(activeCurrent);
    };

    window.addEventListener("selected_constituency_changed", handleStorageChange);
    return () => {
      window.removeEventListener("selected_constituency_changed", handleStorageChange);
    };
  }, []);

  const fetchDecisions = async (constName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.decisions.list({ constituency: constName });
      setDecisions(data);
    } catch (err: any) {
      console.warn("Failed to load decisions ledger:", err);
      setError("Failed to connect to the backend server. Decisions ledger could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Decision["status"]) => {
    setActioningId(id);
    try {
      await api.decisions.updateStatus(id, newStatus);
      // Reload decisions list
      await fetchDecisions(constituency);
    } catch (err: any) {
      setError(`Failed to update action status to ${newStatus}. Please try again.`);
    } finally {
      setActioningId(null);
    }
  };

  // Helper to map actions to Lucide Icons
  const getActionIcon = (action: string) => {
    switch (action) {
      case "Dispatch Volunteers":
        return <Users className="h-4 w-4 text-teal-400" />;
      case "Open Gates":
        return <Unlock className="h-4 w-4 text-emerald-400" />;
      case "Close Gates":
        return <Lock className="h-4 w-4 text-rose-400" />;
      case "Broadcast Messages":
        return <Megaphone className="h-4 w-4 text-indigo-400" />;
      case "Medical Escalation":
        return <Activity className="h-4 w-4 text-red-400" />;
      case "Transport Diversion":
        return <Shuffle className="h-4 w-4 text-amber-400" />;
      case "Parking Redirection":
        return <Compass className="h-4 w-4 text-blue-400" />;
      default:
        return <Sliders className="h-4 w-4 text-slate-400" />;
    }
  };

  // Helper to get action badge colors
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "Dispatch Volunteers":
        return "bg-teal-badge-bg border-teal-badge-text/15 text-teal-badge-text";
      case "Open Gates":
        return "bg-emerald-badge-bg border-emerald-badge-text/15 text-emerald-badge-text";
      case "Close Gates":
        return "bg-rose-badge-bg border-rose-badge-text/15 text-rose-badge-text";
      case "Broadcast Messages":
        return "bg-indigo-badge-bg border-indigo-badge-text/15 text-indigo-badge-text";
      case "Medical Escalation":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "Transport Diversion":
        return "bg-amber-badge-bg border-amber-badge-text/15 text-amber-badge-text";
      case "Parking Redirection":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      default:
        return "bg-slate-800 border-slate-700 text-slate-350";
    }
  };

  // Filtered decisions list
  const filteredDecisions = decisions.filter((d) => {
    if (activeTab === "all") return true;
    return d.status === activeTab;
  });

  return (
    <div className="space-y-8 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2.5">
            <Sliders className="h-6 w-6 text-primary-500" /> Decision Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Deterministic Mitigation Ledger for <strong className="text-slate-300 font-semibold">{constituency}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatrix(!showMatrix)}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-50 font-semibold h-9 px-3 flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {showMatrix ? "Hide Rules" : "Show Rules"}
            {showMatrix ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDecisions(constituency)}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-50 font-semibold h-9 px-3"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync Ledger
          </Button>
        </div>
      </div>

      {/* Mitigation Matrix Rules drawer */}
      {showMatrix && (
        <Card className="border border-slate-800 bg-slate-900/60 transition-all duration-300">
          <CardHeader className="border-b border-slate-800 pb-3 px-5">
            <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="h-4 w-4 text-primary-500" /> Mitigation Matrix Rules
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs font-normal">
              Rules are evaluated deterministically using suggestion descriptions, categories, and priority scores. No LLMs are used for decision matching.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 pr-4">Action</th>
                    <th className="py-2.5 px-4">Deterministic Trigger Conditions</th>
                    <th className="py-2.5 px-4">Expected Impact</th>
                    <th className="py-2.5 pl-4">Responsible Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
                  <tr>
                    <td className="py-2.5 pr-4 text-emerald-400 font-bold">Open Gates</td>
                    <td className="py-2.5 px-4 text-slate-400">Description contains: flood, overflow, clogged drain, water logging, rain AND Severity ≥ 7</td>
                    <td className="py-2.5 px-4">Enable drainage and prevent street flooding</td>
                    <td className="py-2.5 pl-4">Drainage & Flood Response</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-rose-400 font-bold">Close Gates</td>
                    <td className="py-2.5 px-4 text-slate-400">Description contains: security threat, hazard, contamination, spill, toxic, lockdown AND Severity ≥ 8</td>
                    <td className="py-2.5 px-4">Isolate hazardous contamination or secure perimeter</td>
                    <td className="py-2.5 pl-4">Public Safety & Containment</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-red-400 font-bold">Medical Escalation</td>
                    <td className="py-2.5 px-4 text-slate-400">Category: health OR description contains: injury, accident, medical, outbreak, clinic, doctor</td>
                    <td className="py-2.5 px-4">Provide emergency medical care and backup hospital utilities</td>
                    <td className="py-2.5 pl-4">Health & Paramedic Unit</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-amber-400 font-bold">Transport Diversion</td>
                    <td className="py-2.5 px-4 text-slate-400">Category: infrastructure AND description contains: road blocked, landslide, traffic jam, accident</td>
                    <td className="py-2.5 px-4">Redirect traffic around road blockages and damaged bridges</td>
                    <td className="py-2.5 pl-4">Traffic Control & Highway Police</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-blue-400 font-bold">Parking Redirection</td>
                    <td className="py-2.5 px-4 text-slate-400">Description contains: pedestrian congestion, market traffic, station road, hawkers, parking lot</td>
                    <td className="py-2.5 px-4">Direct shopper parking to peripheral lots and clear main road</td>
                    <td className="py-2.5 pl-4">Parking Administration & Wardens</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-indigo-400 font-bold">Broadcast Messages</td>
                    <td className="py-2.5 px-4 text-slate-400">Description contains: power outage, supply cut, load shedding, alert OR Severity ≥ 8</td>
                    <td className="py-2.5 px-4">Alert citizens of emergency warnings and service outages</td>
                    <td className="py-2.5 pl-4">Citizen Alert Office</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-teal-400 font-bold">Dispatch Volunteers</td>
                    <td className="py-2.5 px-4 text-slate-400">Category: community OR description contains: garbage, trash, cleanup, volunteer OR Severity ≥ 5</td>
                    <td className="py-2.5 px-4">Mobilize manpower for cleaning and local repairs</td>
                    <td className="py-2.5 pl-4">Volunteer Coordination Corps</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
      )}

      {error && (
        <ErrorState
          title="Ledger Integration Failed"
          description={error}
          onRetry={() => fetchDecisions(constituency)}
        />
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800">
        {(["all", "pending", "executed", "cancelled"] as const).map((tab) => {
          const count = decisions.filter((d) => tab === "all" || d.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? "border-primary-500 text-slate-50 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab} <span className="ml-1.5 text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded font-mono font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-slate-800 rounded-lg p-5 space-y-3 bg-slate-900/60 animate-pulse">
              <div className="h-4.5 w-1/4 bg-slate-800 rounded" />
              <div className="h-3.5 w-5/6 bg-slate-800 rounded" />
              <div className="h-3.5 w-2/3 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.length > 0 ? (
            filteredDecisions.map((decision) => {
              const actionClass = getActionBadgeClass(decision.action);
              const isPending = decision.status === "pending";
              const isExecuted = decision.status === "executed";
              const isCancelled = decision.status === "cancelled";

              return (
                <Card
                  key={decision._id}
                  className={`border transition-all duration-200 bg-slate-900 ${
                    isExecuted
                      ? "border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.15)] bg-slate-900/90"
                      : isCancelled
                      ? "border-slate-800/40 opacity-70 bg-slate-900/50"
                      : "border-slate-800 hover:border-slate-750"
                  }`}
                >
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-850 px-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider leading-none ${actionClass}`}>
                          {getActionIcon(decision.action)}
                          {decision.action}
                        </span>
                        
                        {isExecuted && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none">
                            <CheckCircle className="h-3 w-3" /> Executed
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-850 border border-slate-800 text-slate-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none">
                            <XCircle className="h-3 w-3" /> Cancelled
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none">
                            <Clock className="h-3 w-3" /> Awaiting Execution
                          </span>
                        )}
                        
                        <span className="text-[10px] text-slate-500 font-semibold font-mono">
                          Logged: {new Date(decision.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-sm sm:text-base font-bold text-slate-50 tracking-tight">
                        {decision.decision}
                      </CardTitle>
                    </div>

                    {/* Execution Actions */}
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actioningId === decision._id}
                          onClick={() => handleUpdateStatus(decision._id, "cancelled")}
                          className="h-8.5 px-3 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800"
                        >
                          Cancel Action
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actioningId === decision._id}
                          onClick={() => handleUpdateStatus(decision._id, "executed")}
                          className="h-8.5 px-4 text-xs font-bold flex items-center gap-1"
                        >
                          Execute Mitigation
                        </Button>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 text-xs font-medium">
                    {/* Reason & Expected Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/40 p-4 rounded border border-slate-850 space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Triggering Reason</span>
                        <p className="text-slate-350 font-normal leading-relaxed">{decision.reason}</p>
                      </div>
                      <div className="bg-slate-950/40 p-4 rounded border border-slate-850 space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Expected Impact</span>
                        <p className="text-slate-350 font-normal leading-relaxed">{decision.expectedImpact}</p>
                      </div>
                    </div>

                    {/* Metadata & Source Suggestion */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-850 pt-4 text-[11px]">
                      <div className="grid grid-cols-2 gap-6 sm:flex sm:items-center sm:space-x-8">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Responsible Team</span>
                          <span className="text-slate-300 font-bold">{decision.responsibleTeam}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Target ETA</span>
                          <span className="text-slate-300 font-bold font-mono">{decision.eta}</span>
                        </div>
                      </div>

                      {decision.suggestionId && (
                        <div className="flex items-center text-slate-400 bg-slate-950/20 px-3 py-1.5 rounded border border-slate-850 max-w-fit md:ml-auto">
                          <AlertTriangle className="h-3.5 w-3.5 text-primary-500 mr-2" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block leading-none">Source Grievance</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[10px] text-slate-300 leading-none">
                                {decision.suggestionId.title.length > 25
                                  ? `${decision.suggestionId.title.substring(0, 25)}...`
                                  : decision.suggestionId.title}
                              </span>
                              <Link
                                href={`/track?id=${decision.suggestionId._id}`}
                                className="text-primary-500 hover:text-primary-400 inline-flex items-center hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
              );
            })
          ) : (
            <EmptyState
              icon={Sliders}
              title="No Logged Decisions"
              description={`There are currently no logged decisions under ${activeTab === "all" ? "" : activeTab + " "}status in ${constituency}.`}
              className="border border-slate-800 bg-slate-905"
            />
          )}
        </div>
      )}
    </div>
  );
}
