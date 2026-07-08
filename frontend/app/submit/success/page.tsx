"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestionId = searchParams.get("id") || "65e8a5b28a9c2b4c10000001";

  return (
    <Card className="border border-slate-800 p-4 max-w-lg mx-auto text-center shadow-md bg-slate-900">
      <CardContent className="space-y-6 pt-8 pb-5 px-6">
        
        {/* Checkmark Indicator */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="mx-auto h-16 w-16 rounded-full bg-emerald-badge-bg border border-emerald-badge-text/15 flex items-center justify-center text-emerald-badge-text"
        >
          <CheckCircle2 className="h-8 w-8" />
        </motion.div>

        <div className="space-y-2">
          <Badge variant="success" className="uppercase tracking-wider text-[9px] px-2.5 py-0.5">
            Suggestion Logged
          </Badge>
          <h2 className="text-xl font-bold text-slate-50">Submission Successful</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-normal">
            Your suggestion has been recorded on the public ledger. Google Gemini AI has initiated automatic sentiment evaluation and urgency calculations.
          </p>
        </div>

        {/* Reference ID copy container */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded space-y-1.5 shadow-inner">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
            Grievance Reference ID
          </span>
          <p className="text-sm font-mono font-bold text-slate-100 select-all select-text tracking-wider leading-none py-2 bg-slate-900 rounded border border-slate-850 mx-auto max-w-xs">
            {suggestionId}
          </p>
          <span className="text-[8px] text-slate-550 block">Click or tap to copy code</span>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="outline" className="w-full sm:w-1/2 flex items-center justify-center text-slate-300 font-semibold border-slate-800 bg-slate-950 h-10" onClick={() => router.push("/")}>
            <Home className="mr-1.5 h-4 w-4" /> Home Page
          </Button>
          
          <Button variant="primary" className="w-full sm:w-1/2 flex items-center justify-center font-semibold h-10" onClick={() => router.push(`/track?id=${suggestionId}`)}>
            Track Status <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuggestionSuccessPage() {
  return (
    <div className="py-12 px-4">
      <Suspense fallback={
        <div className="max-w-lg mx-auto text-center p-12 text-slate-400 font-semibold text-xs">
          Loading success confirmation...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
