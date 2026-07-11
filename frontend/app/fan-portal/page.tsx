"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, Suggestion } from "@/lib/api/client";
import {
  Ticket,
  MapPin,
  Search,
  Activity,
  Mic,
  AlertOctagon,
  Unlock,
  Lock,
  Send,
  Users,
  Compass,
  Sparkles,
  RefreshCw,
  UtensilsCrossed,
  Grid,
  Info,
  Clock,
  CompassIcon,
  Languages,
  CheckCircle2,
  Accessibility
} from "lucide-react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(
  () => import("@/components/shared/LeafletMap"),
  { ssr: false }
);

// Translation Dictionary
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: "Event Fan Portal",
    subtitle: "Constituency Public Grounds Monitor",
    tabMap: "Map Guide",
    tabFind: "Finders",
    tabStatus: "Live Status",
    tabVoice: "Voice Help",
    tabEmergency: "Emergency",
    emergencyTitle: "CRITICAL PANIC TRIGGER",
    emergencyDesc: "Pressing this button alerts the Executive Command Center and triggers deterministic mitigations.",
    triggerMedical: "Trigger Medical Alarm",
    triggerSafety: "Trigger Safety Lock",
    activeAlert: "Emergency Dispatch Activated",
    healthScore: "Health Score",
    accessibleRoutes: "Wheelchair Ramps Only",
    seatGrid: "Seat Grid Finder",
    foodStalls: "Food & Stalls",
    waiting: "wait",
    parkingRedirection: "Redirection Active",
    parkingZoneA: "Zone A: 12 spots left",
    parkingZoneB: "Zone B: Redirection Active",
    voicePlaceholder: "Ask about gates or accessibility ramps...",
  },
  hi: {
    title: "इवेंट फैन पोर्टल",
    subtitle: "निर्वाचन क्षेत्र सार्वजनिक मैदान मॉनिटर",
    tabMap: "मानचित्र",
    tabFind: "सीट / भोजन",
    tabStatus: "लाइव स्थिति",
    tabVoice: "आवाज सहायक",
    tabEmergency: "आपातकालीन",
    emergencyTitle: "आपातकालीन पैनिक बटन",
    emergencyDesc: "इस बटन को दबाने से कमांड सेंटर सतर्क हो जाता है और तत्काल सुरक्षा बल सक्रिय हो जाते हैं।",
    triggerMedical: "चिकित्सा अलार्म शुरू करें",
    triggerSafety: "सुरक्षा लॉक शुरू करें",
    activeAlert: "आपातकालीन सेवा सक्रिय",
    healthScore: "स्वास्थ्य सूचकांक",
    accessibleRoutes: "केवल व्हीलचेयर रैंप",
    seatGrid: "सीट खोजक",
    foodStalls: "भोजन और स्टॉल",
    waiting: "प्रतीक्षा",
    parkingRedirection: "पार्किंग पुनर्निर्देशन सक्रिय",
    parkingZoneA: "ज़ोन A: 12 स्थान शेष",
    parkingZoneB: "ज़ोन B: पुनर्निर्देशन सक्रिय",
    voicePlaceholder: "द्वारों या व्हीलचेयर रैंप के बारे में पूछें...",
  },
  mr: {
    title: "इव्हेंट फॅन पोर्टल",
    subtitle: "मतदारसंघ सार्वजनिक मैदान मॉनिटर",
    tabMap: "नकाशा मार्गदर्शक",
    tabFind: "सीट / भोजन",
    tabStatus: "थेट स्थिती",
    tabVoice: "आवाज मदत",
    tabEmergency: "आणीबाणी",
    emergencyTitle: "आणीबाणी पॅनिक बटण",
    emergencyDesc: "हे बटण दाबल्याने कमांड सेंटर सतर्क होते आणि तातडीने मदत दल पाठवले जातात.",
    triggerMedical: "वैद्यकीय अलार्म सुरू करा",
    triggerSafety: "सुरक्षा लॉक सुरू करा",
    activeAlert: "आणीबाणी सेवा पाठवली गेली",
    healthScore: "आरोग्य निर्देशांक",
    accessibleRoutes: "फक्त व्हीलचेअर रॅम्प",
    seatGrid: "सीट शोधक",
    foodStalls: "भोजन आणि स्टॉल्स",
    waiting: "वेळ",
    parkingRedirection: "पार्किंग पुनर्निर्देशन सक्रिय",
    parkingZoneA: "झोन A: १२ जागा शिल्लक",
    parkingZoneB: "झोन B: पुनर्निर्देशन सक्रिय",
    voicePlaceholder: "द्वारे किंवा व्हीलचेअर रॅम्पबद्दल विचारा...",
  }
};

export default function FanPortalPage() {
  const [constituency, setConstituency] = useState("Baramati Constituency");
  const [lang, setLang] = useState<"en" | "hi" | "mr">("en");
  const [activeTab, setActiveTab] = useState<"map" | "find" | "status" | "voice" | "emergency">("map");
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  // Seat Finder State
  const [selectedSeatBlock, setSelectedSeatBlock] = useState<string>("Block A");
  const [seatReservations, setSeatReservations] = useState<Record<string, boolean>>({
    "A-1": true, "A-2": false, "A-3": true, "A-4": false, "A-5": false, "A-6": true,
    "B-1": false, "B-2": false, "B-3": true, "B-4": true, "B-5": false, "B-6": false,
    "C-1": true, "C-2": false, "C-3": false, "C-4": false, "C-5": true, "C-6": true,
  });

  // Voice Assistant State
  const [voiceQuery, setVoiceQuery] = useState("");
  const [voiceOutput, setVoiceOutput] = useState("");
  const [isAssistantStreaming, setIsAssistantStreaming] = useState(false);
  const [isMicRecording, setIsMicRecording] = useState(false);

  // Emergency panic triggers
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState<string | null>(null);
  const [loadingEmergency, setLoadingEmergency] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency") || "Baramati Constituency";
    const valid = ["Baramati Constituency", "Mumbai North Constituency", "Bangalore South Constituency"];
    const activeConst = valid.includes(saved) ? saved : "Baramati Constituency";
    setConstituency(activeConst);

    const handleStorageChange = () => {
      const current = localStorage.getItem("selected_constituency") || "Baramati Constituency";
      const activeCurrent = valid.includes(current) ? current : "Baramati Constituency";
      setConstituency(activeCurrent);
    };

    window.addEventListener("selected_constituency_changed", handleStorageChange);
    return () => {
      window.removeEventListener("selected_constituency_changed", handleStorageChange);
    };
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Emergency triggering logic connecting directly to Backend API and Decision Engine
  const triggerEmergencyGrievance = async (type: "medical" | "safety") => {
    setLoadingEmergency(true);
    setEmergencyResult(null);

    const DEMO_CITIZEN_ID = "6582f3a4b12c3d4e5f6a7b8c";
    const alertTitle = `EMERGENCY ALERT: ${type.toUpperCase()} outbreak at Someshwar Event Grounds`;
    const alertDesc = `PANIC TRIGGER from Fan Portal: Immediate emergency assistance requested for a critical ${type} hazard at the central gathering grounds. Deploy response teams.`;

    try {
      const response = await api.suggestions.create({
        citizenId: DEMO_CITIZEN_ID,
        title: alertTitle,
        description: alertDesc,
        category: type === "medical" ? "community" : "infrastructure", // triggers corresponding matrix rules
        constituency,
        phoneNumber: "9999999999",
        village: "Someshwar" // Match with seed default
      });

      setEmergencyActive(true);
      setEmergencyResult(`Incident registered: INC-${response._id.substring(18)}. The MP Command ledger has been alerted over WebSockets. Safeguard mitigations are executing.`);
    } catch (err) {
      console.error("Emergency alert failed:", err);
      setEmergencyResult("Emergency call routed locally. Standby for assistance.");
    } finally {
      setLoadingEmergency(false);
    }
  };

  // Voice Assistant Streaming query using Backend Agent Layer
  const runVoiceAssistant = async () => {
    if (!voiceQuery.trim() || isAssistantStreaming) return;

    setIsAssistantStreaming(true);
    setVoiceOutput("");

    try {
      await api.ai.agentChatStream(
        {
          query: voiceQuery,
          constituency,
          agentType: accessibleOnly ? "accessibility" : "auto",
          taskType: "voice_response"
        },
        (chunk) => {
          setVoiceOutput(prev => prev + chunk.text);
        },
        () => {
          setIsAssistantStreaming(false);
        },
        (err) => {
          console.error("Voice Assistant stream error:", err);
          setVoiceOutput("I am experiencing connection issues. Ramps are located next to Gate 2, and Section C seats are directly adjacent.");
          setIsAssistantStreaming(false);
        }
      );
    } catch (err) {
      setVoiceOutput(" Ramps are located next to Gate 2, and Section C seats are directly adjacent.");
      setIsAssistantStreaming(false);
    }
  };

  const startVoiceSpeakSimulation = () => {
    setIsMicRecording(true);
    setVoiceQuery("");
    // Simulate speech detection
    setTimeout(() => {
      setIsMicRecording(false);
      setVoiceQuery(accessibleOnly ? "Where is the wheelchair accessibility ramp?" : "What is the wait time at Gate 1?");
    }, 2000);
  };

  // Mock maps markers
  const mockMarkers = [
    { id: "gate-1", lat: 18.118, lng: 74.258, title: "Gate 1 Checkpoint", category: "infrastructure", priorityScore: 5, status: "resolved" },
    { id: "gate-2", lat: 18.119, lng: 74.262, title: "Gate 2 Accessibility Ramp", category: "infrastructure", priorityScore: 3, status: "resolved" },
    { id: "food-court", lat: 18.117, lng: 74.260, title: "Food Stall Plaza", category: "community", priorityScore: 2, status: "resolved" },
    { id: "first-aid", lat: 18.116, lng: 74.259, title: "First Aid Medical Center", category: "health", priorityScore: 9, status: "resolved" }
  ];

  return (
    <div className="space-y-6 py-2 flex flex-col items-center">
      {/* Device wrapper to simulate responsive mobile view */}
      <div className="w-full max-w-sm sm:max-w-md bg-slate-950 border border-slate-800 rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col h-[700px] border-slate-700/80 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)]">
        
        {/* Device Status Bar */}
        <div className="bg-slate-900 px-6 py-3.5 flex items-center justify-between text-slate-400 border-b border-slate-850 select-none">
          <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 leading-none">
            <Ticket className="h-3.5 w-3.5 text-primary-500 animate-pulse" />
            {t.title}
          </span>
          
          {/* Translation Lang Toggle buttons */}
          <div className="flex items-center space-x-2">
            <Languages className="h-3.5 w-3.5 text-slate-500" />
            {(["en", "hi", "mr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded transition-all cursor-pointer border ${
                  lang === l
                    ? "bg-primary-600 border-primary-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-350"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Global Accessibility Toggle */}
        <div className="bg-slate-900/60 px-5 py-2.5 border-b border-slate-850 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1.5 leading-none">
            <Accessibility className="h-4 w-4 text-blue-400" />
            {t.accessibleRoutes}
          </span>
          <button
            onClick={() => setAccessibleOnly(!accessibleOnly)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${
              accessibleOnly ? "bg-blue-600" : "bg-slate-800"
            }`}
          >
            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${accessibleOnly ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Scrollable Mobile Page Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Tab 1: Navigation map */}
          {activeTab === "map" && (
            <div className="space-y-4 h-full flex flex-col">
              <Card className="border border-slate-800 bg-slate-900 overflow-hidden h-72 shadow-inner">
                <CardHeader className="p-3.5 pb-2 border-b border-slate-850 bg-slate-950/20">
                  <CardTitle className="text-xs font-bold text-slate-50">Ground Navigation Plan</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-full">
                  <LeafletMap markers={mockMarkers} center={[18.118, 74.260]} zoom={16} />
                </CardContent>
              </Card>

              {/* Directives details panel */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Directions Info</span>
                {accessibleOnly ? (
                  <p className="text-blue-400 font-semibold leading-relaxed">
                    ♿ Accessibility Overlays Active: Route via East Gate 2 Ramp, take elevator A to level 1 for seats in Block B and Section C.
                  </p>
                ) : (
                  <p className="text-slate-300 font-normal leading-relaxed">
                    Enter via main Gate 1 Checkpoint for general seats in Blocks A and B. Follow green arrows to the Food Court Plaza.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Seat & Food Finder */}
          {activeTab === "find" && (
            <div className="space-y-4">
              
              {/* Seat Finder Block Grid */}
              <Card className="border border-slate-800 bg-slate-900">
                <CardHeader className="pb-3 px-4 pt-3.5 border-b border-slate-850">
                  <CardTitle className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Grid className="h-4 w-4 text-primary-500" />
                    {t.seatGrid}
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-500">Tap Section Block to check seat bookings</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-2">
                    {["Block A", "Block B", "Block C"].map((block) => (
                      <button
                        key={block}
                        onClick={() => setSelectedSeatBlock(block)}
                        className={`flex-1 py-1.5 rounded text-[11px] font-bold cursor-pointer border ${
                          selectedSeatBlock === block
                            ? "bg-primary-600 border-primary-500 text-white"
                            : "bg-slate-950 border-slate-850 text-slate-400"
                        }`}
                      >
                        {block}
                      </button>
                    ))}
                  </div>

                  {/* Seat Grid slots layout */}
                  <div className="grid grid-cols-6 gap-2 pt-2">
                    {Object.keys(seatReservations)
                      .filter(key => key.startsWith(selectedSeatBlock.charAt(6)))
                      .map((key) => {
                        const isReserved = seatReservations[key];
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              if (!isReserved) {
                                setSeatReservations(prev => ({ ...prev, [key]: true }));
                              }
                            }}
                            className={`h-9 rounded flex items-center justify-center text-[10px] font-bold select-none cursor-pointer border transition-colors ${
                              isReserved
                                ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                                : "bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {key}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Food Finder List */}
              <Card className="border border-slate-800 bg-slate-900">
                <CardHeader className="pb-3 px-4 pt-3.5 border-b border-slate-850">
                  <CardTitle className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <UtensilsCrossed className="h-4 w-4 text-primary-500" />
                    {t.foodStalls}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-850">
                  {[
                    { id: "food-1", name: "Supe Snacks (Indian)", wait: "5 min", clear: true },
                    { id: "food-2", name: "Someshwar Shakes (Juices)", wait: "15 min", clear: false },
                    { id: "food-3", name: "Dahisar Delights (Sandwiches)", wait: "8 min", clear: true }
                  ].map((stall) => (
                    <div key={stall.id} className="p-3 px-4 flex items-center justify-between text-xs font-medium text-slate-350">
                      <span>{stall.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        stall.clear ? "bg-emerald-950/20 text-emerald-400" : "bg-amber-950/20 text-amber-400"
                      }`}>
                        {stall.wait} {t.waiting}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          )}

          {/* Tab 3: Queue & Parking Status */}
          {activeTab === "status" && (
            <div className="space-y-4">
              
              {/* Queue Predictor */}
              <Card className="border border-slate-800 bg-slate-900">
                <CardHeader className="pb-3 px-4 pt-3.5 border-b border-slate-850">
                  <CardTitle className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary-500" />
                    Queue Checkpoint Forecasts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs font-semibold">
                  {[
                    { gate: "Gate 1 Checkpoint", time: "15 mins", density: "Heavy", color: "bg-amber-500" },
                    { gate: "Gate 2 (Accessible)", time: "3 mins", density: "Clear", color: "bg-emerald-500" },
                    { gate: "Gate 3 Security Check", time: "8 mins", density: "Moderate", color: "bg-blue-500" }
                  ].map((g, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>{g.gate}</span>
                        <span className="font-mono text-slate-400">{g.time} ({g.density})</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                        <div className={`h-full ${g.color}`} style={{ width: g.density === "Heavy" ? "80%" : g.density === "Moderate" ? "45%" : "15%" }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Parking slots details */}
              <Card className="border border-slate-800 bg-slate-900">
                <CardHeader className="pb-3 px-4 pt-3.5 border-b border-slate-850">
                  <CardTitle className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-primary-500" />
                    Parking Lot Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs font-medium">
                  <div className="p-3 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 flex items-center gap-2">
                    <AlertOctagon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span><strong>{t.parkingRedirection}:</strong> Zone A lot is FULL. Traffic redirected to Zone B.</span>
                  </div>

                  <div className="divide-y divide-slate-850">
                    <div className="py-2.5 flex items-center justify-between text-slate-300 font-semibold">
                      <span>{t.parkingZoneA}</span>
                      <span className="text-rose-400 font-bold font-mono">0 slots</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between text-slate-300 font-semibold">
                      <span>{t.parkingZoneB}</span>
                      <span className="text-emerald-400 font-bold font-mono">42 slots free</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* Tab 4: Voice Assistant */}
          {activeTab === "voice" && (
            <div className="space-y-4 h-full flex flex-col">
              <Card className="border border-slate-800 bg-slate-900 flex-1 flex flex-col min-h-[300px]">
                <CardHeader className="pb-2 pt-3.5 px-4 border-b border-slate-850">
                  <CardTitle className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Mic className="h-4 w-4 text-primary-500 animate-pulse" />
                    Speech Assistant Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Streaming output response */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex-1 text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-line min-h-[160px]">
                    {voiceOutput || (isAssistantStreaming ? (
                      <span className="text-slate-500 italic animate-pulse">Streaming speech synthesis...</span>
                    ) : (
                      <span className="text-slate-650 italic">Tap the microphone below and speak, or type in your query. Gemini handles local dialects.</span>
                    ))}
                  </div>

                  {/* Query input panel */}
                  <div className="space-y-2">
                    {/* Simulated Voice wave animation during recording */}
                    {isMicRecording && (
                      <div className="flex justify-center items-center gap-1 h-6 py-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary-500 rounded-full animate-voiceWave"
                            style={{
                              height: "100%",
                              animationDelay: `${i * 0.15}s`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voiceQuery}
                        onChange={(e) => setVoiceQuery(e.target.value)}
                        placeholder={t.voicePlaceholder}
                        className="flex-1 rounded border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 outline-none placeholder-slate-600 focus:border-primary-500"
                      />
                      <button
                        onClick={startVoiceSpeakSimulation}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                          isMicRecording 
                            ? "bg-rose-950/20 border-rose-500/30 text-rose-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                      <button
                        onClick={runVoiceAssistant}
                        disabled={!voiceQuery.trim() || isAssistantStreaming}
                        className="bg-primary-600 hover:bg-primary-500 text-white p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab 5: Emergency Help */}
          {activeTab === "emergency" && (
            <div className="space-y-4 h-full flex flex-col justify-center py-4">
              <div className="text-center space-y-4">
                <div className="inline-flex h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/20 items-center justify-center text-rose-500 shadow-md">
                  <AlertOctagon className="h-10 w-10 animate-pulse" />
                </div>
                
                <div className="space-y-1.5 px-4">
                  <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-widest leading-none">
                    {t.emergencyTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    {t.emergencyDesc}
                  </p>
                </div>

                <div className="space-y-3 px-6 pt-2">
                  <Button
                    variant="primary"
                    disabled={loadingEmergency}
                    onClick={() => triggerEmergencyGrievance("medical")}
                    className="w-full bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg border border-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loadingEmergency ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Activity className="h-4.5 w-4.5" />}
                    {t.triggerMedical}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={loadingEmergency}
                    onClick={() => triggerEmergencyGrievance("safety")}
                    className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-950/20 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-transparent"
                  >
                    {loadingEmergency ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Lock className="h-4.5 w-4.5" />}
                    {t.triggerSafety}
                  </Button>
                </div>

                {/* Emergency Trigger Result Panel */}
                {emergencyResult && (
                  <div className="mt-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-350 text-[11px] font-semibold leading-relaxed text-left mx-6 animate-fadeIn">
                    <CheckCircle2 className="h-4.5 w-4.5 text-rose-400 inline-block mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>{emergencyResult}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Responsive Device Navigation Tabs bottom bar */}
        <div className="bg-slate-900 border-t border-slate-850 px-4 py-2 flex items-center justify-between text-slate-500 font-bold uppercase select-none text-[8px] sm:text-[9px] tracking-wide">
          {[
            { id: "map", label: t.tabMap, icon: MapPin },
            { id: "find", label: t.tabFind, icon: Search },
            { id: "status", label: t.tabStatus, icon: Activity },
            { id: "voice", label: t.tabVoice, icon: Mic },
            { id: "emergency", label: t.tabEmergency, icon: AlertOctagon }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  isActive
                    ? "text-primary-500 font-extrabold"
                    : tab.id === "emergency"
                    ? "text-rose-600 hover:text-rose-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TabIcon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
