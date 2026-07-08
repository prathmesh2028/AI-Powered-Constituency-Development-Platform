"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { CATEGORIES, DEFAULT_CONSTITUENCY, DEMO_CITIZEN_ID, CONSTITUENCIES_MAP } from "@/constants";

import {
  MapPin,
  MessageSquare,
  Mic,
  ArrowLeft,
  X,
  Volume2,
  Upload,
  ChevronRight,
  Info
} from "lucide-react";

export default function SuggestionPortal() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    village: "",
    constituency: DEFAULT_CONSTITUENCY,
    phoneNumber: "",
    title: "",
    category: "infrastructure" as "infrastructure" | "policy" | "community" | "other",
    description: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency") || DEFAULT_CONSTITUENCY;
    const valid = ["Baramati Constituency", "Mumbai North Constituency", "Bangalore South Constituency"];
    const activeConst = valid.includes(saved) ? saved : DEFAULT_CONSTITUENCY;
    setFormData((prev) => ({ ...prev, constituency: activeConst }));
  }, []);

  const activeVillages = CONSTITUENCIES_MAP[formData.constituency as keyof typeof CONSTITUENCIES_MAP] || CONSTITUENCIES_MAP["Baramati Constituency"];

  // Attachments
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Voice Recording Mock
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [recordingIntervalId, setRecordingIntervalId] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image Upload handler integrating with backend POST /api/v1/upload/image
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const res = await api.upload.image(file);
      setUploadedImage(res.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Make sure file is < 5MB and is an image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Mock Voice Recording handlers
  const startRecording = () => {
    setIsRecording(true);
    setVoiceNoteDuration(0);
    const interval = setInterval(() => {
      setVoiceNoteDuration((d) => d + 1);
    }, 1000);
    setRecordingIntervalId(interval);
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordingIntervalId);
    setHasVoiceNote(true);
  };

  const deleteVoiceNote = () => {
    setHasVoiceNote(false);
    setVoiceNoteDuration(0);
  };

  // Form Validation matching backend Zod schema
  const validateStep1 = () => {
    if (!formData.village.trim() || formData.village.length < 2) {
      setError("Please select your village name");
      return false;
    }
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Please enter a valid 10-15 digit phone number");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (formData.title.length < 5 || formData.title.length > 100) {
      setError("Subject title must be between 5 and 100 characters");
      return false;
    }
    if (formData.description.length < 10) {
      setError("Description must be at least 10 characters");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create the Suggestion in MongoDB via backend
      const suggestion = await api.suggestions.create({
        citizenId: DEMO_CITIZEN_ID,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        constituency: formData.constituency,
        phoneNumber: formData.phoneNumber,
        village: formData.village,
      });

      // Perform live Gemini Sentiment/Priority analysis in the frontend context
      try {
        const analysis = await api.ai.analyzeSuggestion(formData.description);
        // Save analysis context in localStorage linked to the suggestion ID
        localStorage.setItem(`ai_analysis_${suggestion._id}`, JSON.stringify(analysis));
      } catch (aiErr) {
        console.warn("AI analysis offline/errored, falling back to static tracking", aiErr);
      }

      router.push(`/submit/success?id=${suggestion._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit suggestion. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      {/* Navigation and Indicator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-slate-400 hover:text-slate-200 transition-colors h-8">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <span className="text-xs font-semibold text-slate-500">
          Constituency Portal
        </span>
      </div>

      {/* Main Form Container */}
      <Card className="overflow-hidden border border-slate-800 bg-slate-900 shadow-lg relative">
        {/* Flat Minimal Progress Indicator */}
        <div className="absolute top-0 inset-x-0 h-1 bg-slate-800">
          <div 
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <CardHeader className="space-y-2 pt-8 pb-5 px-6 border-b border-slate-800 bg-slate-950/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-50">
              Submit Grievance or Proposal
            </CardTitle>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
              Step {step} of 3
            </span>
          </div>
          <CardDescription className="text-xs text-slate-400 leading-relaxed font-normal">
            Your grievance or development proposal is analyzed directly by Gemini AI and sorted onto your Representative's active priority board.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded bg-rose-badge-bg border border-rose-badge-text/15 text-rose-badge-text text-xs font-semibold flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-badge-text" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-primary-500" />
                  <span>Constituency & Contact Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col space-y-1.5 w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Target Constituency
                    </label>
                    <input
                      disabled
                      value={formData.constituency}
                      className="flex h-10 w-full rounded border border-slate-850 bg-slate-950 px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5 w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Village
                    </label>
                    <select
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-950 text-slate-500">Choose village name</option>
                      {activeVillages.map((v) => (
                        <option key={v} value={v} className="bg-slate-950 text-slate-200">
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Input
                    label="Mobile Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10-15 digit number"
                    type="tel"
                    required
                    className="h-10 text-xs"
                  />
                  <p className="text-[10px] text-slate-500 font-normal">Used to send tracking status updates regarding your report.</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-800">
                  <MessageSquare className="h-3.5 w-3.5 text-primary-500" />
                  <span>Topic & Detailed Description</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Grievance Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.id as any }))}
                          className={cn(
                            "flex items-start gap-3 p-3.5 rounded border bg-slate-950/20 cursor-pointer transition-colors",
                            isSelected 
                              ? "border-primary-500 bg-primary-950/10" 
                              : "border-slate-800 hover:border-slate-750 hover:bg-slate-950/50"
                          )}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded flex items-center justify-center border",
                            isSelected ? "bg-primary-950 border-primary-500 text-primary-400" : "bg-slate-900 border-slate-850 text-slate-500"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className={cn("text-[11px] font-bold", isSelected ? "text-slate-50" : "text-slate-300")}>{cat.label}</h4>
                            <p className="text-[9px] text-slate-500 leading-normal font-normal">{cat.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Subject Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Muddy well water supply issue"
                  required
                  className="h-10 text-xs"
                />

                <Textarea
                  label="Full Details"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Explain what needs fixing, the location details, and how many houses are affected."
                  required
                  rows={5}
                  className="text-xs"
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-800">
                  <Upload className="h-3.5 w-3.5 text-primary-500" />
                  <span>Attachments & Supporting Proof</span>
                </div>

                {/* Upload Photos area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Add Image / Photograph
                  </label>
                  {uploadedImage ? (
                    <div className="relative rounded border border-slate-850 h-36 bg-slate-950 flex items-center justify-center group">
                      <img src={uploadedImage} alt="Attachment preview" className="object-contain max-h-full max-w-full p-2" />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded p-6 bg-slate-950/20 text-center hover:bg-slate-950/40 transition-colors relative flex flex-col items-center justify-center space-y-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingImage}
                      />
                      <Upload className="h-5 w-5 text-slate-500" />
                      <div className="text-xs text-slate-400">
                        {uploadingImage ? (
                          <span className="text-primary-500 font-bold animate-pulse">Uploading attachment...</span>
                        ) : (
                          <span>Drop image file here or <strong className="text-primary-500 font-semibold">browse</strong></span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">JPEG or PNG under 5MB</span>
                    </div>
                  )}
                </div>

                {/* Voice Grievance section */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Add Voice Note (Optional)
                  </label>
                  <div className="border border-slate-800 rounded p-4 bg-slate-950/30 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center border transition-colors",
                        isRecording ? "bg-rose-badge-bg border-rose-badge-text/20 text-rose-badge-text" :
                        hasVoiceNote ? "bg-emerald-badge-bg border-emerald-badge-text/20 text-emerald-badge-text" :
                        "bg-slate-900 border-slate-800 text-slate-500"
                      )}>
                        {isRecording ? <Volume2 className="h-4.5 w-4.5 animate-pulse" /> : <Mic className="h-4.5 w-4.5" />}
                      </div>
                      <div className="space-y-0.5">
                        {isRecording ? (
                          <>
                            <p className="text-[11px] font-bold text-rose-badge-text animate-pulse">Recording audio note...</p>
                            <span className="text-[9px] text-slate-500 uppercase font-semibold">{voiceNoteDuration}s / 60s</span>
                          </>
                        ) : hasVoiceNote ? (
                          <>
                            <p className="text-[11px] font-bold text-emerald-badge-text">Audio file captured</p>
                            <span className="text-[9px] text-slate-500 font-normal">Speech note • {voiceNoteDuration}s</span>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] font-semibold text-slate-300">Speak your complaint</p>
                            <span className="text-[9px] text-slate-500 font-normal">Gemini translates dialects automatically</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      {isRecording ? (
                        <Button variant="outline" size="sm" onClick={stopRecording} className="text-[11px] h-8 border-rose-badge-text/20 text-rose-badge-text hover:bg-rose-badge-bg px-3">
                          Stop
                        </Button>
                      ) : hasVoiceNote ? (
                        <Button variant="ghost" size="sm" onClick={deleteVoiceNote} className="text-[11px] h-8 text-slate-500 hover:text-red-400">
                          Remove
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={startRecording} className="text-[11px] h-8 border-slate-850 bg-slate-900 text-slate-300 hover:text-slate-50 px-3">
                          Record
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification card */}
                <div className="p-3.5 rounded border border-slate-850 bg-slate-950/40 space-y-1 text-xs">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Verification Summary</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 text-[10px]">Location:</span>
                      <p className="font-semibold text-slate-300">{formData.village || "Not selected"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Category:</span>
                      <p className="font-semibold text-slate-300 capitalize">{formData.category}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between p-4.5 border-t border-slate-800 bg-slate-950/40">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={loading} className="h-9 px-4 text-slate-300 hover:bg-slate-850">
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button variant="primary" onClick={handleNext} className="h-9 px-4">
              Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} loading={loading} className="h-9 px-5">
              Submit Grievance
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
