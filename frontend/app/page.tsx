"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Users,
  CheckCircle,
  BarChart3,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="space-y-24 py-10">
      {/* 1. Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center space-y-8 py-16 px-4">
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] -z-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1 rounded-full"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary-500" />
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Gemini 2.0 Decision Engine Active
          </span>
        </motion.div>

        <div className="space-y-4 max-w-4xl">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-50 leading-[1.1]"
          >
            AI-Powered Constituency Development Platform
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            A SaaS-grade municipal decision platform. Synthesize citizen grievances, extract priority concerns, and optimize resource distribution through real-time natural language analysis.
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2"
        >
          <Link href="/submit" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto font-semibold flex items-center justify-center group h-11 px-6 shadow-sm">
              Submit Grievance <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto font-semibold flex items-center justify-center border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-50 h-11 px-6">
              Representative Portal
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Mock Dashboard Preview Window (Premium SaaS Product Mockup) */}
      <section className="max-w-5xl mx-auto px-4">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-xl overflow-hidden"
        >
          {/* Header controls bar */}
          <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
            </div>
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Live System Preview</div>
            <div className="w-12" />
          </div>
          {/* Mock Preview Content */}
          <div className="bg-slate-950 rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> High Priority Alert
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-300">Urgency Score: 9.2/10</span>
              </div>
              <h3 className="text-base font-bold text-slate-50 leading-snug">Urgent clean water delivery system failure in Nira village sector</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                "We haven't had clean pipe water supply for the past 14 days. The local well water is highly muddy. Many children are falling ill due to contamination..."
              </p>
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center space-x-1.5">
                  <BrainCircuit className="h-4 w-4 text-primary-500" />
                  <span className="text-[11px] font-bold text-slate-200">Gemini Extraction Analysis</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                  Needs extracted: Clean Water Logistics, Well Sanitation. Action: Dispatch water tankers and schedule pipe infrastructure maintenance budget.
                </p>
              </div>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Decision Indicators</span>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Confidence Metric</span>
                    <span className="text-emerald-500 font-semibold">98.4%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98.4%]" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">SLA Timeline</span>
                    <span className="text-amber-500 font-semibold">Normal (48h)</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <Link href="/dashboard">
                  <Button size="sm" className="w-full text-xs bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 font-semibold h-9">
                    Explore Representative Board
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Problem Statement */}
      <section className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="primary" className="uppercase tracking-wider text-[10px] px-3.5 py-0.5">The Challenge</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-50">Why Local Representation Stalls</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Traditional grievance systems suffer from manual bottlenecks, slowing down critical municipal responses.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "Unstructured Feedback",
              desc: "Grievances come in via letters, regional dialects, or voice inputs, creating heavy review pipelines.",
              icon: MessageSquare,
            },
            {
              title: "Opaque Prioritization",
              desc: "Difficult to isolate high-impact suggestions from minor requests, resulting in misallocated budgets.",
              icon: TrendingUp,
            },
            {
              title: "Information Gap",
              desc: "Citizens have no transparent path to track progress, causing public distrust in administrative tools.",
              icon: Users,
            },
          ].map((prob, idx) => (
            <motion.div variants={itemVariants} key={idx}>
              <Card className="border border-slate-800 bg-slate-900">
                <CardContent className="space-y-4 pt-6">
                  <div className="h-9 w-9 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                    <prob.icon className="h-4.5 w-4.5 text-primary-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-50">{prob.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">{prob.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. How It Works */}
      <section className="space-y-12 max-w-5xl mx-auto px-4 py-12 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="text-center space-y-3">
          <Badge variant="primary" className="uppercase tracking-wider text-[10px] px-3.5 py-0.5">Workflow</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-50">Inside the Civic Intelligence Loop</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Our automated processing workflow bridges community submissions with target resources immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Grievance Logged", desc: "Citizen submits a detailed suggestion with regional tags and status tracking parameters.", icon: CheckCircle },
            { step: "02", title: "AI Analysis", desc: "Google Gemini classifies categories, extracts priority scores, and designs concise action summaries.", icon: BrainCircuit },
            { step: "03", title: "Metrics Unified", desc: "Dashboard aggregates regional issues, highlighting critical priorities for administrative review.", icon: BarChart3 },
            { step: "04", title: "Targeted Response", desc: "MPs track local action workflows to deploy public work budgets directly to local villages.", icon: ShieldCheck },
          ].map((flow, i) => (
            <div key={i} className="flex flex-col space-y-3 p-4.5 rounded-lg border border-slate-800 bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-800">{flow.step}</span>
                <flow.icon className="h-4.5 w-4.5 text-slate-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-50">{flow.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">{flow.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AI Engine Features */}
      <section className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="primary" className="uppercase tracking-wider text-[10px] px-3.5 py-0.5">AI Engine</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-50">Decisions Driven by Gemini 2.0 Flash</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Real-Time Priority Scoring",
              desc: "Gemini evaluates civic severity, environmental factors, and regional population impact to calculate scores from 1 to 10 immediately.",
              badge: "Auto-Scoring"
            },
            {
              title: "Multilingual Dialect Extraction",
              desc: "Supports regional queries. Extracts primary grievances, sentiment scores, and urgent requirements without translation overhead.",
              badge: "Local NLP"
            },
            {
              title: "Grievance Aggregation",
              desc: "Consolidates redundant citizen suggestions into a unified executive report, reducing legislative reviewing times.",
              badge: "Summaries"
            },
            {
              title: "Policy & Budget Recommendations",
              desc: "Drafts detailed action guides, estimated feasibility statistics, and funding channels tailored to municipal budgets.",
              badge: "Advisory"
            },
          ].map((feat, i) => (
            <Card key={i} className="bg-slate-900 border border-slate-800">
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-50">{feat.title}</h4>
                  <Badge variant="primary" className="text-[9px] uppercase px-2 py-0.5">{feat.badge}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Key Statistics */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {[
            { value: "48 Hours", label: "Resolution SLA" },
            { value: "98.2%", label: "Category Extraction" },
            { value: "Instant", label: "Gemini Analysis Speed" },
            { value: "100%", label: "API Compliance" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col justify-center space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Call To Action */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative border border-slate-800 bg-slate-900 rounded-xl p-8 sm:p-12 text-center space-y-6 overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-50 tracking-tight leading-tight">Empower Your Local Governance</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-normal">
            Submit a grievance directly to the community platform, or access the MP dashboard to inspect active regional concerns and prioritize project budgets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/submit" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto h-10 px-6 font-semibold">
                Submit Your Suggestion
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-10 px-6 font-semibold border-slate-800 bg-slate-950 text-slate-300 hover:text-slate-50">
                Open MP Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
