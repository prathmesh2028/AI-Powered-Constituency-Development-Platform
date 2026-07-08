"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  ArrowLeft,
  KeyRound,
  Fingerprint
} from "lucide-react";
import { CONSTITUENCIES } from "@/components/shared/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"citizen" | "mp">("citizen");
  const [citizenStep, setCitizenStep] = useState<"info" | "otp">("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [citizenPhone, setCitizenPhone] = useState("");
  const [citizenConstituency, setCitizenConstituency] = useState("Baramati Constituency");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // OTP inputs state (4 digits)
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Resend OTP countdown
  const [countdown, setCountdown] = useState(0);

  // MP credentials state
  const [mpEmail, setMpEmail] = useState("");
  const [mpPassword, setMpPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) return;

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1); // Only keep the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        // Clear current value
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs[index - 1].current?.focus();
      }
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
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
      setCitizenStep("otp");
      setCountdown(59);
      // Reset OTP values
      setOtp(["", "", "", ""]);
      // Automatically focus first OTP input box after rendering
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 150);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      setError("Please enter the 4-digit verification code");
      return;
    }

    if (enteredOtp !== "1234") {
      setError("Invalid code. Use demo code: 1234");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("user_role", "citizen");
      localStorage.setItem("citizen_phone", citizenPhone);
      localStorage.setItem("selected_constituency", citizenConstituency);
      window.dispatchEvent(new Event("selected_constituency_changed"));

      setSuccess("Citizen authentication successful. Entering portal...");
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

  const getLabel = (val: string) => {
    return CONSTITUENCIES.find((c) => c.value === val)?.label.replace(/^[^\s]+\s+/, "") || val;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative py-12 px-4">
      {/* Decorative background grid and ambient radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-primary-500/15 to-indigo-500/15 blur-[100px] rounded-full -z-25" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="glass-panel border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-visible">
          {/* Header Brand */}
          <div className="pt-8 px-6 pb-2 text-center space-y-2.5">
            <div className="mx-auto h-11 w-11 rounded-xl bg-gradient-to-tr from-primary-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/10">
              <Sparkles className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-50 tracking-tight flex items-center justify-center gap-1.5">
                🏛️ CivicPrioritize
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                Constituency Entry Desk
              </p>
            </div>
          </div>

          {/* Portal Tabs Selector */}
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850 relative overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("citizen");
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer relative z-10 ${
                  activeTab === "citizen" ? "text-active-text" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Citizen Portal
                {activeTab === "citizen" && (
                  <motion.div
                    layoutId="activeTabBubble"
                    className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mp");
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer relative z-10 ${
                  activeTab === "mp" ? "text-active-text" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                MP Portal
                {activeTab === "mp" && (
                  <motion.div
                    layoutId="activeTabBubble"
                    className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>

          <CardHeader className="pb-3 pt-6 px-6">
            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
              {activeTab === "citizen" ? (
                <>
                  <Fingerprint className="h-5 w-5 text-primary-400" /> Access Grievance Desk
                </>
              ) : (
                <>
                  <KeyRound className="h-5 w-5 text-indigo-400" /> Representative Ledger Login
                </>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 font-normal">
              {activeTab === "citizen"
                ? "Verify your constituency and phone to report issues or check tracking records."
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
                  className="p-3.5 rounded bg-rose-badge-bg border border-rose-badge-text/15 text-rose-badge-text text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
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
                  className="p-3.5 rounded bg-emerald-badge-bg border border-emerald-badge-text/15 text-emerald-badge-text text-xs font-semibold flex items-start gap-2.5 overflow-hidden"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Render Tab Form with transitions */}
            <AnimatePresence mode="wait">
              {activeTab === "citizen" ? (
                <motion.div
                  key="citizen-flow"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <AnimatePresence mode="wait">
                    {citizenStep === "info" ? (
                      <motion.form
                        key="citizen-info-step"
                        onSubmit={handleSendOtp}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5 flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Select Your Constituency
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 shadow-sm transition-all focus:border-primary-500 focus:bg-slate-900/40 focus:outline-none cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <span>{CONSTITUENCIES.find((c) => c.value === citizenConstituency)?.label.split(" ")[0]}</span>
                                <span>{getLabel(citizenConstituency)}</span>
                              </span>
                              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {isDropdownOpen && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-12 left-0 w-full bg-slate-950 rounded-lg border border-slate-800 shadow-xl py-1 z-55 overflow-hidden"
                                  >
                                    {CONSTITUENCIES.map((c) => (
                                      <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => {
                                          setCitizenConstituency(c.value);
                                          setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-[11px] font-bold transition-colors flex items-center justify-between hover:bg-slate-900 border-l-2 cursor-pointer ${
                                          citizenConstituency === c.value 
                                            ? "text-active-text bg-active-bg/20 border-primary-500" 
                                            : "text-slate-400 border-transparent"
                                        }`}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span>{c.label.split(" ")[0]}</span>
                                          <span>{c.label.replace(/^[^\s]+\s+/, "")}</span>
                                        </span>
                                        {citizenConstituency === c.value && <Check className="h-4 w-4 text-primary-500" />}
                                      </button>
                                    ))}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Mobile Number
                          </label>
                          <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                              <Phone className="h-4 w-4" />
                            </span>
                            <input
                              type="tel"
                              placeholder="Enter 10-digit number"
                              value={citizenPhone}
                              onChange={(e) => setCitizenPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              className="flex h-11 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 shadow-sm transition-all focus:border-primary-500 focus:bg-slate-900/20 focus:outline-none"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          disabled={loading}
                          className="w-full font-bold flex items-center justify-center gap-1.5 h-11 mt-6 text-xs cursor-pointer shadow-md shadow-primary-500/10"
                        >
                          {loading ? "Generating OTP..." : "Get OTP Code"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="citizen-otp-step"
                        onSubmit={handleVerifyOtp}
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="space-y-5"
                      >
                        <div className="text-center space-y-1.5">
                          <p className="text-xs text-slate-350">
                            We've sent a 4-digit code to your phone number:
                          </p>
                          <p className="text-xs font-bold text-slate-200 tracking-wide">
                            +91 {citizenPhone.slice(0, 5)} {citizenPhone.slice(5)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setCitizenStep("info")}
                            className="text-[10px] font-bold text-primary-400 hover:text-primary-350 hover:underline flex items-center justify-center gap-1 mx-auto mt-2 cursor-pointer"
                          >
                            <ArrowLeft className="h-3 w-3" /> Change number
                          </button>
                        </div>

                        {/* OTP 4 Digit Inputs */}
                        <div className="flex justify-center gap-3 my-4">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={otpRefs[index]}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(e.target.value, index)}
                              onKeyDown={(e) => handleOtpKeyDown(e, index)}
                              className="w-12 h-12 text-center text-lg font-bold bg-slate-950 border border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-100 rounded-xl focus:outline-none transition-all"
                            />
                          ))}
                        </div>

                        <div className="text-[10px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-850 leading-relaxed font-semibold">
                          💡 <strong>Demo Code:</strong> Enter <code className="text-primary-400">1234</code> to authenticate successfully.
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500 font-medium">Didn't receive code?</span>
                          {countdown > 0 ? (
                            <span className="text-slate-400 font-bold">Resend in {countdown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCountdown(59);
                                setError(null);
                                setSuccess("New demo OTP generated!");
                              }}
                              className="text-primary-400 font-bold hover:underline cursor-pointer"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          disabled={loading}
                          className="w-full font-bold flex items-center justify-center gap-1.5 h-11 mt-4 text-xs cursor-pointer shadow-md shadow-primary-500/10"
                        >
                          {loading ? "Verifying..." : "Verify & Enter Portal"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.form
                  key="mp-flow"
                  onSubmit={handleMpLogin}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Official Email Address
                    </label>
                    <div className="relative w-full">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="admin@civic.gov"
                        value={mpEmail}
                        onChange={(e) => setMpEmail(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 shadow-sm transition-all focus:border-primary-500 focus:bg-slate-900/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative w-full">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={mpPassword}
                        onChange={(e) => setMpPassword(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-500 shadow-sm transition-all focus:border-primary-500 focus:bg-slate-900/20 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-850 leading-relaxed font-semibold">
                    💡 <strong>Demo Credentials:</strong> Use <code className="text-primary-400">admin@civic.gov</code> with password <code className="text-primary-400">admin</code>.
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full font-bold flex items-center justify-center gap-1.5 h-11 mt-6 text-xs cursor-pointer shadow-md shadow-primary-500/10"
                  >
                    {loading ? "Authenticating..." : "Login to Representative Portal"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
