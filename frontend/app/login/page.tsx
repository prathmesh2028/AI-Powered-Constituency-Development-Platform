"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Sparkles, ArrowRight, User, ShieldAlert, CheckCircle2 } from "lucide-react";
import { CONSTITUENCIES } from "@/components/shared/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"citizen" | "mp">("citizen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [citizenPhone, setCitizenPhone] = useState("");
  const [citizenConstituency, setCitizenConstituency] = useState("Baramati Constituency");

  const [mpEmail, setMpEmail] = useState("");
  const [mpPassword, setMpPassword] = useState("");

  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!citizenPhone.trim() || citizenPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("user_role", "citizen");
      localStorage.setItem("citizen_phone", citizenPhone);
      localStorage.setItem("selected_constituency", citizenConstituency);
      // Dispatch custom event to sync navbar/layout
      window.dispatchEvent(new Event("selected_constituency_changed"));

      setSuccess("Citizen authentication successful. Redirecting...");
      setTimeout(() => {
        router.push("/submit");
      }, 1000);
    }, 800);
  };

  const handleMpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!mpEmail.trim() || !mpEmail.includes("@")) {
      setError("Please enter a valid official email address");
      return;
    }

    if (!mpPassword || mpPassword.length < 4) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Clean mock validation for local dashboard presentation
      if (mpEmail === "admin@civic.gov" && mpPassword === "admin") {
        localStorage.setItem("user_role", "representative");
        localStorage.setItem("mp_email", mpEmail);
        setSuccess("MP authentication successful. Entering Representative portal...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError("Invalid official credentials. Use demo: admin@civic.gov / admin");
      }
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative py-12 px-4">
      {/* Decorative background grid and ambient radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-primary-500/10 to-indigo-500/10 blur-[90px] rounded-full -z-25" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
          {/* Header Brand */}
          <div className="pt-8 px-6 pb-2 text-center space-y-2">
            <div className="mx-auto h-9 w-9 rounded bg-gradient-to-tr from-primary-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-50 uppercase tracking-wide">CivicPrioritize</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Constituency Login Desk</p>
            </div>
          </div>

          {/* Portal Tabs Selector */}
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded border border-slate-850">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("citizen");
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  activeTab === "citizen"
                    ? "bg-slate-900 text-active-text border border-slate-800"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mp");
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  activeTab === "mp"
                    ? "bg-slate-900 text-active-text border border-slate-800"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                MP Portal
              </button>
            </div>
          </div>

          <CardHeader className="pb-3 pt-6 px-6">
            <CardTitle className="text-base font-bold text-slate-100">
              {activeTab === "citizen" ? "Access Citizen Grievance Portal" : "Representative Log In"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">
              {activeTab === "citizen"
                ? "Verify your constituency and phone to report requirements or track status."
                : "Official gateway for Members of Parliament and designated administrative officers."}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-2 space-y-4">
            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded bg-rose-badge-bg border border-rose-badge-text/15 text-rose-badge-text text-xs font-semibold flex items-start gap-2 overflow-hidden"
                >
                  <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Success Message Box */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded bg-emerald-badge-bg border border-emerald-badge-text/15 text-emerald-badge-text text-xs font-semibold flex items-start gap-2 overflow-hidden"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Render Tab Form */}
            {activeTab === "citizen" ? (
              <form onSubmit={handleCitizenLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Your Constituency
                  </label>
                  <select
                    value={citizenConstituency}
                    onChange={(e) => setCitizenConstituency(e.target.value)}
                    className="flex h-10 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    {CONSTITUENCIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-slate-950 text-slate-200">
                        {c.label.replace(/^[^\s]+\s+/, "")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="bg-slate-950 border-slate-800 text-xs tracking-wide h-10"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full font-bold flex items-center justify-center gap-1.5 h-10 mt-6"
                >
                  {loading ? "Verifying..." : "Enter Portal"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMpLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Official Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. admin@civic.gov"
                    value={mpEmail}
                    onChange={(e) => setMpEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="e.g. admin"
                    value={mpPassword}
                    onChange={(e) => setMpPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs h-10"
                  />
                </div>

                <div className="text-[10px] text-slate-500 bg-slate-950/40 p-2.5 rounded border border-slate-850 leading-relaxed font-semibold">
                  💡 <strong>Demo Credentials:</strong> Use <code className="text-primary-400">admin@civic.gov</code> with password <code className="text-primary-400">admin</code>.
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full font-bold flex items-center justify-center gap-1.5 h-10 mt-6"
                >
                  {loading ? "Authenticating..." : "Login to Portal"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
