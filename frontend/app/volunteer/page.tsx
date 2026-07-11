"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusChip } from "@/components/ui/Badge";
import { api, Decision } from "@/lib/api/client";
import { CONSTITUENCY_GEOGRAPHY } from "@/constants";
import dynamic from "next/dynamic";
import {
  ClipboardList,
  MapPin,
  Clock,
  Mic,
  Camera,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Send,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Radio
} from "lucide-react";

const LeafletMap = dynamic(
  () => import("@/components/shared/LeafletMap"),
  { ssr: false }
);

interface ActiveTimer {
  decisionId: string;
  secondsRemaining: number;
}

export default function VolunteerCopilotPage() {
  const [constituency, setConstituency] = useState("Baramati Constituency");
  const [tasks, setTasks] = useState<Decision[]>([]);
  const [selectedTask, setSelectedTask] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket Live Monitor State
  const [isConnected, setIsConnected] = useState(false);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  // Task Countdown timers state
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});

  // AI Suggestions Copilot advice
  const [copilotAdvice, setCopilotAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Secondary Incident Reporting form
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportVillage, setReportVillage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingOutput, setRecordingOutput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency") || "Baramati Constituency";
    const valid = ["Baramati Constituency", "Mumbai North Constituency", "Bangalore South Constituency"];
    const activeConst = valid.includes(saved) ? saved : "Baramati Constituency";
    setConstituency(activeConst);
    fetchTasks(activeConst);

    const handleStorageChange = () => {
      const current = localStorage.getItem("selected_constituency") || "Baramati Constituency";
      const activeCurrent = valid.includes(current) ? current : "Baramati Constituency";
      setConstituency(activeCurrent);
      fetchTasks(activeCurrent);
    };

    window.addEventListener("selected_constituency_changed", handleStorageChange);
    return () => {
      window.removeEventListener("selected_constituency_changed", handleStorageChange);
    };
  }, []);

  // Timer countdown ticker hook
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setActiveTimers((prev) => {
        const next: Record<string, number> = {};
        let updated = false;
        Object.keys(prev).forEach((id) => {
          if (prev[id] > 0) {
            next[id] = prev[id] - 1;
            updated = true;
          } else {
            next[id] = 0;
          }
        });
        return updated ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // WebSocket Telemetry integration for dynamic dispatches
  useEffect(() => {
    const isHttps = window.location.protocol === "https:";
    const host = window.location.hostname === "localhost" ? "localhost:5000" : window.location.host;
    const wsProto = isHttps ? "wss:" : "ws:";
    const finalHost = host.includes("localhost") || host.includes("127.0.0.1") ? "localhost:5000" : host;
    
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`${wsProto}//${finalHost}`);

      ws.onopen = () => {
        setIsConnected(true);
        console.log("🔌 Volunteer Copilot WebSocket Linked");
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          // If a new decision has action matching Dispatch Volunteers in this constituency
          if (parsed.type === "NEW_DECISION" && parsed.data.action === "Dispatch Volunteers" && parsed.data.constituency === constituency) {
            setTasks(prev => [parsed.data, ...prev]);
            setLiveNotification(`New field task dispatched: "${parsed.data.decision}"`);
            
            // Initialize timer countdown
            const seconds = parseEtaToSeconds(parsed.data.eta || "4h");
            setActiveTimers(prev => ({ ...prev, [parsed.data._id]: seconds }));

            setTimeout(() => setLiveNotification(null), 6000);
          } else if (parsed.type === "DECISION_UPDATE" && parsed.data.action === "Dispatch Volunteers" && parsed.data.constituency === constituency) {
            setTasks(prev => prev.map(t => t._id === parsed.data._id ? parsed.data : t));
          }
        } catch (e) {
          console.warn("WebSocket parse failed in Volunteer Portal:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (wsErr) {
      console.warn("WebSocket hook failed in Volunteer Portal:", wsErr);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [constituency]);

  const fetchTasks = async (constName: string) => {
    setLoading(true);
    setError(null);
    try {
      // Pull mitigations related to dispatching volunteers
      const res = await api.decisions.list({ constituency: constName });
      const volunteerDispatches = res.filter((d: Decision) => d.action === "Dispatch Volunteers") || [];
      setTasks(volunteerDispatches);

      // Prepopulate timer count offsets
      const timers: Record<string, number> = {};
      volunteerDispatches.forEach((t: Decision) => {
        if (t.status === "executed") {
          timers[t._id] = 0;
        } else {
          timers[t._id] = parseEtaToSeconds(t.eta || "6h");
        }
      });
      setActiveTimers(timers);

      if (volunteerDispatches.length > 0 && !selectedTask) {
        setSelectedTask(volunteerDispatches[0]);
      }
    } catch (err) {
      console.warn("Failed to synchronize volunteer tasks:", err);
      setError("Failed to synchronize volunteer dispatches from the backend ledger.");
    } finally {
      setLoading(false);
    }
  };

  const parseEtaToSeconds = (etaStr: string) => {
    const hoursMatch = etaStr.match(/(\d+)\s*h/i);
    const minsMatch = etaStr.match(/(\d+)\s*m/i);
    let totalSeconds = 0;
    if (hoursMatch) totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    if (minsMatch) totalSeconds += parseInt(minsMatch[1], 10) * 60;
    
    // Default to 4 hours if string is unparseable
    return totalSeconds > 0 ? totalSeconds : 4 * 3600;
  };

  const formatTimer = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "00:00:00 (Elapsed)";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleUpdateTaskStatus = async (id: string, status: "pending" | "executed") => {
    try {
      await api.decisions.updateStatus(id, status);
      await fetchTasks(constituency);
    } catch (err) {
      setError("Failed to update status on server.");
    }
  };

  // AI Copilot Suggestions Checklists generator using Volunteer Agent
  const fetchAICopilotAdvice = async (task: Decision) => {
    setLoadingAdvice(true);
    setCopilotAdvice("");
    try {
      const prompt = `Task Action: ${task.action}. Details: ${task.decision}. Target Village: ${task.village}. Generate a step-by-step tactical safety check-sheet for field volunteer teams. Keep it bulleted and practical.`;
      
      await api.ai.agentChatStream(
        {
          query: prompt,
          constituency,
          agentType: "volunteer",
          taskType: "summary"
        },
        (chunk) => {
          setCopilotAdvice(prev => prev + chunk.text);
        },
        () => {
          setLoadingAdvice(false);
        },
        (err) => {
          console.error("AI Copilot request error:", err);
          setCopilotAdvice("• Wear protective gloves and safety gear.\n• Coordinates with municipal loader crews.\n• Keep clear of heavy machinery zones.");
          setLoadingAdvice(false);
        }
      );
    } catch (err) {
      setCopilotAdvice("• Wear protective gloves and safety gear.\n• Coordinates with municipal loader crews.\n• Keep clear of heavy machinery zones.");
      setLoadingAdvice(false);
    }
  };

  // Field incident reporting with voice/photo
  const handlePhotoUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceReportSimulation = () => {
    setIsRecording(true);
    setRecordingOutput("");
    
    // Simulates voice dictation and agent parsing
    setTimeout(() => {
      setIsRecording(false);
      setReportTitle("Secondary Debris Hazard");
      setReportDesc("Discarded scrap iron and metal sheets piled near the pedestrian walkway. Safety obstruction.");
      setReportVillage(selectedTask?.village || "Someshwar");
    }, 2500);
  };

  const submitSecondaryIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDesc.trim()) return;

    try {
      const DEMO_CITIZEN_ID = "6582f3a4b12c3d4e5f6a7b8c";
      await api.suggestions.create({
        citizenId: DEMO_CITIZEN_ID,
        title: `[Volunteer Field Report] ${reportTitle}`,
        description: reportDesc,
        category: "community",
        constituency,
        phoneNumber: "9999999999",
        village: reportVillage || selectedTask?.village || "Someshwar"
      });

      // Clear Form
      setReportTitle("");
      setReportDesc("");
      setReportVillage("");
      setImagePreview(null);
      
      addLocalAlert("Secondary incident logged. Mitigation logged.");
    } catch (err) {
      setError("Failed to register incident report.");
    }
  };

  const [localAlert, setLocalAlert] = useState<string | null>(null);
  const addLocalAlert = (msg: string) => {
    setLocalAlert(msg);
    setTimeout(() => setLocalAlert(null), 5000);
  };

  // Map settings
  const geo = CONSTITUENCY_GEOGRAPHY[constituency] || CONSTITUENCY_GEOGRAPHY["Baramati Constituency"];
  const getSelectedTaskCoords = () => {
    if (selectedTask && selectedTask.village && geo.villages[selectedTask.village]) {
      return [geo.villages[selectedTask.village].lat, geo.villages[selectedTask.village].lng] as [number, number];
    }
    return geo.center;
  };

  const taskMarkers = selectedTask ? [{
    id: selectedTask._id,
    lat: getSelectedTaskCoords()[0],
    lng: getSelectedTaskCoords()[1],
    title: selectedTask.decision,
    category: "community",
    priorityScore: 8,
    status: selectedTask.status === "executed" ? "resolved" : "under_review"
  }] : [];

  return (
    <div className="space-y-6 py-2">
      {/* Live Header Monitor */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-500" />
            Volunteer Field Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-ping" : "bg-slate-650"}`} />
            {isConnected ? "Active Telemetry link" : "Offline / Local sync"}
            <span>•</span> Live dispatches for <strong className="text-slate-350 font-semibold">{constituency}</strong>
          </p>
        </div>
      </div>

      {/* Realtime Live Dispatch Notification Toast */}
      {liveNotification && (
        <div className="p-4 bg-primary-950 border border-primary-500/30 text-primary-200 text-xs font-semibold rounded-lg flex items-center justify-between shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)] animate-fadeIn">
          <span className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary-500 animate-pulse animate-spin" />
            {liveNotification}
          </span>
          <Button variant="ghost" size="xs" onClick={() => setLiveNotification(null)} className="h-6 text-[10px] uppercase font-bold text-slate-400">Dismiss</Button>
        </div>
      )}

      {localAlert && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5" />
          <span>{localAlert}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-badge-bg border border-rose-badge-text/15 text-rose-badge-text text-xs font-semibold flex items-center gap-2 rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Taskboard split with directions and reports */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Volunteer Task board list */}
        <div className="xl:col-span-1 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            Dispatched Tasks ({tasks.length})
          </h2>

          <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
            {!loading && tasks.length > 0 ? (
              tasks.map((t) => {
                const isActive = selectedTask?._id === t._id;
                const timerSecs = activeTimers[t._id] || 0;
                
                return (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSelectedTask(t);
                      setCopilotAdvice("");
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      isActive
                        ? "border-primary-500 bg-primary-950/10 shadow-[0_0_15px_-8px_rgba(59,130,246,0.2)]"
                        : "border-slate-850 bg-slate-900/60 hover:border-slate-800"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[8px] font-bold text-primary-400 bg-primary-500/10 border border-primary-500/20 px-1.5 py-0.2 rounded uppercase">
                          {t.village}
                        </span>
                        <span className={`text-[8px] font-bold uppercase ${t.status === "executed" ? "text-emerald-400" : "text-amber-400"}`}>
                          {t.status === "executed" ? "Completed" : "Active"}
                        </span>
                      </div>
                      <h4 className="text-[12px] font-bold text-slate-200 leading-snug line-clamp-2">{t.decision}</h4>
                    </div>

                    {/* Countdown indicator */}
                    {t.status !== "executed" && (
                      <div className="pt-2 border-t border-slate-950 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-650" />
                          <span>ETA Timer:</span>
                        </span>
                        <span className={`font-mono font-bold ${timerSecs < 1800 ? "text-rose-400 animate-pulse" : "text-slate-400"}`}>
                          {formatTimer(timerSecs)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : !loading ? (
              <div className="py-12 text-center text-slate-500 text-xs font-semibold border border-slate-850 bg-slate-900/20 rounded-xl">
                No active dispatches.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-20 w-full bg-slate-900/40 rounded-xl animate-pulse" />
                <div className="h-20 w-full bg-slate-900/40 rounded-xl animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Active Detail Dashboard split */}
        <div className="xl:col-span-3 space-y-6">
          {selectedTask ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Task Details, maps directions and AI Advice */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Details header block */}
                <Card className="border border-slate-800 bg-slate-900">
                  <CardHeader className="pb-3 px-5 pt-4 border-b border-slate-850 flex flex-row items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-50">Active Assignment Guidelines</CardTitle>
                      <CardDescription className="text-[11px] text-slate-500 mt-1">Village Scope: {selectedTask.village} • eta target: {selectedTask.eta}</CardDescription>
                    </div>

                    <div className="flex gap-2">
                      {selectedTask.status !== "executed" ? (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleUpdateTaskStatus(selectedTask._id, "executed")}
                          className="h-8 text-[11px] font-bold"
                        >
                          Complete Task
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleUpdateTaskStatus(selectedTask._id, "pending")}
                          className="h-8 text-[11px] font-bold border-slate-800"
                        >
                          Reopen Task
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Decision Directive</span>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">{selectedTask.decision}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Mitigation Reason</span>
                      <p className="text-xs text-slate-400 font-normal leading-relaxed">{selectedTask.reason}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Leaflet Navigation Map */}
                <Card className="border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
                  <CardHeader className="p-3.5 pb-2 border-b border-slate-850 bg-slate-950/20">
                    <CardTitle className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary-500" />
                      Field Directions Guideline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-64">
                    {!loading ? (
                      <LeafletMap markers={taskMarkers} center={getSelectedTaskCoords()} zoom={16} />
                    ) : (
                      <div className="w-full h-full bg-slate-950/20 animate-pulse" />
                    )}
                  </CardContent>
                </Card>

                {/* AI Copilot Suggestions Advice */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <Sparkles className="h-4 w-4 text-primary-500" /> AI Volunteer Copilot Advice
                    </h3>
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={loadingAdvice}
                      onClick={() => fetchAICopilotAdvice(selectedTask)}
                      className="border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-50 text-[10px] font-bold h-7 px-2.5"
                    >
                      {loadingAdvice ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                      Request AI Checklists
                    </Button>
                  </div>

                  {copilotAdvice && (
                    <div className="p-4 rounded-xl border border-primary-500/15 bg-primary-950/5 text-slate-300 text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line animate-fadeIn">
                      {copilotAdvice}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Field Incident reporter */}
              <div className="lg:col-span-1">
                <Card className="border border-slate-800 bg-slate-900">
                  <CardHeader className="pb-3 px-4 pt-3.5 border-b border-slate-850">
                    <CardTitle className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
                      Log Field Hazard
                    </CardTitle>
                    <CardDescription className="text-[10px] text-slate-500">Report secondary incident logs from field</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2.5">
                    <form onSubmit={submitSecondaryIncident} className="space-y-4">
                      
                      {/* Recording button */}
                      <div className="flex justify-between items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                          <Mic className={`h-3.5 w-3.5 ${isRecording ? "text-rose-500 animate-pulse" : "text-slate-650"}`} />
                          {isRecording ? "Listening..." : "Voice Dictate"}
                        </span>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={handleVoiceReportSimulation}
                          className="h-7 text-[9px] font-extrabold border-slate-800"
                        >
                          Record Field Note
                        </Button>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-slate-400">Incident Category / Title</label>
                        <input
                          type="text"
                          required
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          placeholder="e.g. Broken pavement, road blockage"
                          className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 outline-none placeholder-slate-600 focus:border-primary-500 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <label className="text-slate-400">Incident Details</label>
                        <textarea
                          required
                          rows={3}
                          value={reportDesc}
                          onChange={(e) => setReportDesc(e.target.value)}
                          placeholder="Provide safety hazards and details"
                          className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 outline-none placeholder-slate-600 focus:border-primary-500 font-medium"
                        />
                      </div>

                      {/* Photo upload mock */}
                      <div className="space-y-2 text-xs font-semibold">
                        <label className="text-slate-400 block">Incident Photo Attachment</label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer border border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors p-2.5 rounded-lg flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase select-none">
                            <Camera className="h-4 w-4" />
                            <span>Select Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUploadSimulate}
                              className="hidden"
                            />
                          </label>
                          {imagePreview && (
                            <div className="h-10 w-10 rounded border border-slate-800 overflow-hidden">
                              <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={!reportTitle.trim() || !reportDesc.trim()}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" /> Submit Incident
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-slate-500 text-xs font-semibold border border-slate-850 bg-slate-900/10 rounded-2xl">
              Select an assignment on the left to start work.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
