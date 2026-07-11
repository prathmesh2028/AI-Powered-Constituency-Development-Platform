"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api, Suggestion } from "@/lib/api/client";
import {
  MessageSquare,
  Send,
  Users,
  Unlock,
  Lock,
  Megaphone,
  Activity,
  Shuffle,
  Compass,
  Sliders,
  Brain,
  FileText,
  Languages,
  Mic,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Settings,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  agentType?: string;
  contextSuggestions?: any[];
  isFallback?: boolean;
}

export default function AgentChatPage() {
  const [constituency, setConstituency] = useState("Baramati Constituency");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>("auto");
  const [activeTask, setActiveTask] = useState<string>("chat");
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency") || "Baramati Constituency";
    const valid = ["Baramati Constituency", "Mumbai North Constituency", "Bangalore South Constituency"];
    const activeConst = valid.includes(saved) ? saved : "Baramati Constituency";
    setConstituency(activeConst);

    // Initial Welcome Message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: `Welcome to the CivicPrioritize Multi-Agent Console. I am the central Executive Agent. 
You can query constituency grievances in natural language, request incident reports, translate local reports, or summarize specific issue domains.
Select an agent focus above or leave it on **Auto Router** to have my orchestration model automatically match your query.`,
        agentType: "executive"
      }
    ]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setError(null);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: "assistant",
      text: "",
      agentType: activeAgent === "auto" ? "executive" : activeAgent
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setQuery("");
    setLoading(true);

    try {
      await api.ai.agentChatStream(
        {
          query: userMessage.text,
          constituency,
          agentType: activeAgent,
          taskType: activeTask
        },
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantPlaceholderId) {
                return {
                  ...msg,
                  text: msg.text + chunk.text,
                  agentType: chunk.agentType,
                  contextSuggestions: chunk.contextSuggestions,
                  isFallback: chunk.isFallback
                };
              }
              return msg;
            })
          );
        },
        () => {
          setLoading(false);
        },
        (err) => {
          console.error("Chat Stream Error:", err);
          setError("Failed to generate response stream. Connection to Gemini Agent Layer was disrupted.");
          setLoading(false);
        }
      );
    } catch (err: any) {
      setError(err.message || "Failed to establish chat stream.");
      setLoading(false);
    }
  };

  const getAgentLabel = (type: string) => {
    switch (type) {
      case "executive":
        return "Executive Agent";
      case "crowd":
        return "Crowd Agent";
      case "medical":
        return "Medical Agent";
      case "security":
        return "Security Agent";
      case "volunteer":
        return "Volunteer Agent";
      case "accessibility":
        return "Accessibility Agent";
      case "transport":
        return "Transport Agent";
      default:
        return "Auto Router";
    }
  };

  const getAgentIcon = (type: string, className = "h-4 w-4") => {
    switch (type) {
      case "executive":
        return <Brain className={`${className} text-primary-500`} />;
      case "crowd":
        return <Users className={`${className} text-teal-400`} />;
      case "medical":
        return <Activity className={`${className} text-red-400`} />;
      case "security":
        return <Lock className={`${className} text-rose-400`} />;
      case "volunteer":
        return <Sliders className={`${className} text-indigo-400`} />;
      case "accessibility":
        return <Compass className={`${className} text-blue-400`} />;
      case "transport":
        return <Shuffle className={`${className} text-amber-400`} />;
      default:
        return <Sparkles className={`${className} text-slate-400`} />;
    }
  };

  const getAgentTheme = (type: string) => {
    switch (type) {
      case "executive": return "border-primary-500/20 bg-primary-500/5 text-primary-400";
      case "crowd": return "border-teal-500/20 bg-teal-500/5 text-teal-400";
      case "medical": return "border-red-500/20 bg-red-500/5 text-red-400";
      case "security": return "border-rose-500/20 bg-rose-500/5 text-rose-400";
      case "volunteer": return "border-indigo-500/20 bg-indigo-500/5 text-indigo-400";
      case "accessibility": return "border-blue-500/20 bg-blue-500/5 text-blue-400";
      case "transport": return "border-amber-500/20 bg-amber-500/5 text-amber-400";
      default: return "border-slate-800 bg-slate-950 text-slate-400";
    }
  };

  const agentOptions = [
    { id: "auto", name: "Auto Router", desc: "Central orchestration classification model" },
    { id: "executive", name: "Executive Agent", desc: "High-level policy summaries & briefings" },
    { id: "crowd", name: "Crowd Agent", desc: "Hawkers crowd flow & sidewalk navigation safety" },
    { id: "medical", name: "Medical Agent", desc: "Sanitation leaks, health center support & contamination" },
    { id: "security", name: "Security Agent", desc: "Street lighting gaps, audits & park lockdowns" },
    { id: "volunteer", name: "Volunteer Agent", desc: "Mobilizing local cleanups & manual manpower logistics" },
    { id: "accessibility", name: "Accessibility Agent", desc: "Standard accessibility ramps, footpaths & senior safety" },
    { id: "transport", name: "Transport Agent", desc: "Potholes, detours, highway blockages & bridge risks" }
  ];

  const taskOptions = [
    { id: "chat", name: "General Chat", icon: MessageSquare },
    { id: "summary", name: "Summary Report", icon: FileText },
    { id: "briefing", name: "Executive Brief", icon: Settings },
    { id: "translation", name: "Translate dialect", icon: Languages },
    { id: "voice_response", name: "Voice Script", icon: Mic },
    { id: "incident_report", name: "Incident Sheet", icon: AlertTriangle }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 py-2 h-[calc(100vh-100px)]">
      {/* Configuration Sidebar Panel */}
      <div className="xl:col-span-1 flex flex-col gap-5 h-full overflow-y-auto pr-2 border-r border-slate-850/60 xl:border-b-0 pb-6 xl:pb-0">
        <div>
          <h2 className="text-sm font-bold text-slate-50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-primary-500" /> Cognitive Directives
          </h2>
          <p className="text-slate-400 text-xs font-normal">
            Configure agent routing and response formatting directives.
          </p>
        </div>

        {/* Task Profiles */}
        <Card className="border border-slate-800 bg-slate-900">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider">Format Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-1">
            {taskOptions.map((task) => {
              const TaskIcon = task.icon;
              const isSelected = activeTask === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition-colors cursor-pointer text-left font-semibold border ${
                    isSelected
                      ? "bg-active-bg text-active-text border-active-border"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                  }`}
                >
                  <TaskIcon className="h-3.5 w-3.5" />
                  <span>{task.name}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Specialized Agents */}
        <Card className="border border-slate-800 bg-slate-900 flex-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider">Focus Target</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-1 overflow-y-auto">
            {agentOptions.map((opt) => {
              const isSelected = activeAgent === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveAgent(opt.id)}
                  className={`w-full text-left p-2.5 rounded transition-all cursor-pointer border flex items-start gap-2.5 ${
                    isSelected
                      ? "border-primary-500 bg-primary-950/10"
                      : "border-slate-850 bg-slate-950/20 hover:border-slate-800 hover:bg-slate-850/35"
                  }`}
                >
                  <div className="mt-0.5">
                    {getAgentIcon(opt.id, "h-4 w-4")}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`text-[11px] font-bold ${isSelected ? "text-slate-50" : "text-slate-300"}`}>
                      {opt.name}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-normal leading-normal">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Console */}
      <div className="xl:col-span-3 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg relative">
        {/* Chat Window Header */}
        <div className="bg-slate-950/40 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <MessageSquare className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-50 leading-none">Assistant Chat Console</h3>
              <span className="text-[9px] text-slate-500 font-semibold tracking-wide flex items-center mt-1">
                Active Constituency Context: <strong className="text-slate-400 font-bold ml-1">{constituency}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded uppercase tracking-wider">
              Task: {activeTask.replace("_", " ")}
            </span>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded uppercase tracking-wider">
              Agent: {getAgentLabel(activeAgent)}
            </span>
          </div>
        </div>

        {/* Error panel */}
        {error && (
          <div className="p-3.5 bg-rose-badge-bg border-b border-rose-badge-text/15 text-rose-badge-text text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-950/10">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const currentAgent = msg.agentType || "executive";
            const hasSuggestions = msg.contextSuggestions && msg.contextSuggestions.length > 0;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center flex-shrink-0 bg-slate-950 shadow-inner ${getAgentTheme(currentAgent)}`}>
                    {getAgentIcon(currentAgent, "h-4 w-4")}
                  </div>
                )}

                <div className={`space-y-2.5 max-w-2xl ${isUser ? "text-right" : "text-left"}`}>
                  {/* Name header for assistant */}
                  {!isUser && (
                    <span className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">
                      {getAgentLabel(currentAgent)} {msg.isFallback && "(Fallback Plan)"}
                    </span>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed border font-medium ${
                      isUser
                        ? "bg-primary-950/20 border-primary-500/20 text-slate-50"
                        : "bg-slate-900/60 border-slate-850 text-slate-300"
                    }`}
                  >
                    {/* Render text with simple line breaks support */}
                    <div className="whitespace-pre-line font-normal">
                      {msg.text || (loading && msg.id === messages[messages.length - 1].id ? (
                        <span className="inline-flex gap-1 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
                        </span>
                      ) : "")}
                    </div>

                    {/* Context Suggestions list */}
                    {hasSuggestions && (
                      <div className="mt-4.5 pt-3.5 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-primary-500" />
                          <span>Reviewed Database Reports context ({msg.contextSuggestions!.length})</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {msg.contextSuggestions!.map((s: any) => (
                            <div key={s._id} className="bg-slate-950/50 p-2.5 rounded border border-slate-850/60 flex items-start justify-between gap-3 hover:border-slate-800 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-350">{s.title}</span>
                                  <span className="text-[8px] font-bold text-slate-500 uppercase bg-slate-950 px-1 py-0.2 rounded">
                                    {s.village}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-500 line-clamp-1 font-normal">{s.description}</p>
                              </div>
                              <Link href={`/track?id=${s._id}`} className="p-1 rounded text-primary-500 hover:text-primary-400 hover:bg-slate-900 transition-colors">
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="h-8 w-8 rounded-full border border-primary-500/20 bg-primary-950/15 flex items-center justify-center flex-shrink-0 text-primary-400 shadow-inner font-extrabold text-[10px] uppercase">
                    ME
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="bg-slate-950/40 p-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            disabled={loading}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              loading
                ? "Streaming response..."
                : `Ask the ${getAgentLabel(activeAgent)} about local grievances...`
            }
            className="flex-1 rounded border border-slate-800 bg-slate-950 px-4 py-3 text-xs sm:text-sm font-medium text-slate-200 placeholder-slate-600 outline-none focus:border-primary-550 transition-colors"
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-11 w-11 p-0 flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white rounded-lg flex-shrink-0 transition-colors shadow"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
