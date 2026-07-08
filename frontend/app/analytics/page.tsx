"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { TableSkeleton, StatsSkeleton } from "@/components/ui/Skeletons";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, Suggestion } from "@/lib/api/client";
import { CONSTITUENCY_GEOGRAPHY } from "@/constants";
import dynamic from "next/dynamic";

const CategoryBarChart = dynamic(
  () => import("@/components/shared/DashboardCharts").then((mod) => mod.CategoryBarChart),
  { ssr: false }
);

const TrendAreaChart = dynamic(
  () => import("@/components/shared/DashboardCharts").then((mod) => mod.TrendAreaChart),
  { ssr: false }
);

const LeafletMap = dynamic(
  () => import("@/components/shared/LeafletMap"),
  { ssr: false }
);

import {
  BarChart3,
  TrendingUp,
  Map as MapIcon,
  RefreshCw,
  HelpCircle
} from "lucide-react";

interface VillageData {
  village: string;
  total: number;
  critical: number;
  averagePriority: number;
}

export default function AnalyticsPage() {
  const [constituency, setConstituency] = useState("Baramati Constituency");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selected_constituency") || "Baramati Constituency";
    const valid = ["Baramati Constituency", "Mumbai North Constituency", "Bangalore South Constituency"];
    const activeConst = valid.includes(saved) ? saved : "Baramati Constituency";
    setConstituency(activeConst);
    fetchAnalytics(activeConst);

    const handleStorageChange = () => {
      const current = localStorage.getItem("selected_constituency") || "Baramati Constituency";
      const activeCurrent = valid.includes(current) ? current : "Baramati Constituency";
      setConstituency(activeCurrent);
      fetchAnalytics(activeCurrent);
    };

    window.addEventListener("selected_constituency_changed", handleStorageChange);
    return () => {
      window.removeEventListener("selected_constituency_changed", handleStorageChange);
    };
  }, []);

  const fetchAnalytics = async (constName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.suggestions.list({ constituency: constName, limit: 100 });
      const items = Array.isArray(res) ? res : (res as any).data || [];
      setSuggestions(items);
    } catch (err: any) {
      setError("Failed to load analytics records. Check if backend server is online.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Dynamic Village Grievance Ranking aggregator
  const getVillageRankings = (): VillageData[] => {
    const map = new Map<string, { total: number; critical: number; sumPriority: number; countPriority: number }>();
    
    suggestions.forEach((s) => {
      const vill = s.village || "Unknown";
      const cached = map.get(vill) || { total: 0, critical: 0, sumPriority: 0, countPriority: 0 };
      
      cached.total += 1;
      
      const aiCache = localStorage.getItem(`ai_analysis_${s._id}`);
      let score = s.priorityScore;
      if (score === null && aiCache) {
        score = JSON.parse(aiCache).priority;
      }

      if (score !== null) {
        cached.sumPriority += score;
        cached.countPriority += 1;
        if (score >= 8) cached.critical += 1;
      }
      
      map.set(vill, cached);
    });

    return Array.from(map.entries())
      .map(([name, stats]) => ({
        village: name,
        total: stats.total,
        critical: stats.critical,
        averagePriority: stats.countPriority > 0 ? Math.round((stats.sumPriority / stats.countPriority) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  // 2. Dynamic Recharts Category Distribution helper
  const getCategoryData = () => {
    const cats = { infrastructure: 0, policy: 0, community: 0, other: 0 };
    suggestions.forEach((s) => {
      const c = s.category || "other";
      if (cats[c] !== undefined) cats[c] += 1;
    });

    return [
      { name: "Infrastructure", count: cats.infrastructure },
      { name: "Policy & Rules", count: cats.policy },
      { name: "Community", count: cats.community },
      { name: "Other Civic", count: cats.other },
    ];
  };

  // 3. Monthly Trends helper
  const getTrendData = () => {
    return [
      { month: "Jan", suggestions: Math.max(0, suggestions.length - 8) },
      { month: "Feb", suggestions: Math.max(0, suggestions.length - 4) },
      { month: "Mar", suggestions: Math.max(0, suggestions.length - 2) },
      { month: "Apr", suggestions: suggestions.length },
    ];
  };

  const villageRankings = getVillageRankings();
  const geo = CONSTITUENCY_GEOGRAPHY[constituency] || CONSTITUENCY_GEOGRAPHY["Baramati Constituency"];

  const getMapMarkers = () => {
    const center = geo.center;

    return suggestions.map((s, index) => {
      let lat = 0;
      let lng = 0;

      if (geo.villages[s.village]) {
        lat = geo.villages[s.village].lat;
        lng = geo.villages[s.village].lng;
      } else {
        let hash = 0;
        const name = s.village || "Unknown";
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const latOffset = ((hash % 100) / 4500) + (index * 0.0025 - 0.005);
        const lngOffset = (((hash >> 8) % 100) / 4500) + (index * -0.0025 + 0.005);
        lat = center[0] + latOffset;
        lng = center[1] + lngOffset;
      }

      const aiCache = localStorage.getItem(`ai_analysis_${s._id}`);
      let priorityScore = s.priorityScore || 5;
      if (s.priorityScore === null && aiCache) {
        priorityScore = JSON.parse(aiCache).priority || 5;
      }

      return {
        id: s._id,
        lat,
        lng,
        village: s.village || "Unknown",
        title: s.title,
        category: s.category || "other",
        priorityScore,
        status: s.status
      };
    });
  };

  const markers = getMapMarkers();

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary-500" /> Spatial Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Advanced territorial analytics and density rankings for <strong className="text-slate-350 font-semibold">{constituency}</strong>
          </p>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={() => fetchAnalytics(constituency)} className="border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-50 font-semibold h-9 px-3">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync Analytics
          </Button>
        </div>
      </div>

      {error && (
        <ErrorState 
          title="Recalculate Failed" 
          description={error} 
          onRetry={() => fetchAnalytics(constituency)} 
        />
      )}

      {loading ? (
        <div className="space-y-6">
          <StatsSkeleton />
          <TableSkeleton />
        </div>
      ) : (
        <>
          {/* Top grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Map Container */}
            <Card className="border border-slate-800 bg-slate-900 flex flex-col justify-between overflow-hidden">
              <CardHeader className="border-b border-slate-800 pb-3 px-5">
                <CardTitle className="text-sm font-bold text-slate-50 flex items-center gap-2">
                  <MapIcon className="h-4.5 w-4.5 text-primary-500" /> Geographic Footprint
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-normal">Hotspots by reported issues</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden h-56">
                <LeafletMap markers={markers} center={geo.center} zoom={geo.zoom} />
              </CardContent>
              <CardFooter className="py-2.5 px-5 bg-slate-950/20 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Active Coordinates</span>
                <span>Projection Ledger</span>
              </CardFooter>
            </Card>

            {/* Category volume chart */}
            <Card className="border border-slate-800 bg-slate-900">
              <CardHeader className="border-b border-slate-800 pb-3 px-5">
                <CardTitle className="text-sm font-bold text-slate-50 flex items-center gap-2">
                  Category Volume
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-normal">Grievance breakdown count</CardDescription>
              </CardHeader>
              <CardContent className="h-56 p-4">
                <CategoryBarChart data={getCategoryData()} />
              </CardContent>
            </Card>

            {/* Submission trends chart */}
            <Card className="border border-slate-800 bg-slate-900">
              <CardHeader className="border-b border-slate-800 pb-3 px-5">
                <CardTitle className="text-sm font-bold text-slate-50 flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-emerald-500" /> Submission Volume Trends
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-normal">Submissions mapped by month</CardDescription>
              </CardHeader>
              <CardContent className="h-56 p-4">
                <TrendAreaChart data={getTrendData()} />
              </CardContent>
            </Card>
          </div>

          {/* Village Ranking Grid Table */}
          <Card className="border border-slate-800 bg-slate-900 shadow-sm">
            <CardHeader className="border-b border-slate-800 pb-3 px-5">
              <CardTitle className="text-sm font-bold text-slate-50 flex items-center gap-2">
                Settlement Incident Rankings
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">Villages sorted by reported frequency and calculated urgency severity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {villageRankings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5 text-[11px] uppercase font-bold text-slate-400">Village</TableHead>
                      <TableHead className="text-[11px] uppercase font-bold text-slate-400">Total Grievances</TableHead>
                      <TableHead className="text-[11px] uppercase font-bold text-slate-400">Critical (Urgency ≥8)</TableHead>
                      <TableHead className="text-[11px] uppercase font-bold text-slate-400">Average Severity</TableHead>
                      <TableHead className="text-[11px] uppercase font-bold text-slate-400">Action Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {villageRankings.map((v, i) => (
                      <TableRow key={i} className="hover:bg-slate-950/20 transition-colors">
                        <TableCell className="font-bold text-slate-50 px-5 text-xs">{v.village}</TableCell>
                        <TableCell className="text-xs text-slate-300">{v.total}</TableCell>
                        <TableCell className="text-xs">
                          {v.critical > 0 ? (
                            <Badge variant="error" className="text-[10px] tracking-wide uppercase px-2 py-0.5">{v.critical} critical</Badge>
                          ) : (
                            <span className="text-slate-500 font-medium">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300 text-xs">
                          {v.averagePriority > 0 ? `${v.averagePriority} / 10` : "Pending"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {v.averagePriority >= 8 ? (
                            <Badge variant="error" className="text-[9px] uppercase tracking-wider px-2 py-0.5">Critical Intervention</Badge>
                          ) : v.averagePriority >= 5 ? (
                            <Badge variant="warning" className="text-[9px] uppercase tracking-wider px-2 py-0.5">Moderate Action</Badge>
                          ) : (
                            <Badge variant="primary" className="text-[9px] uppercase tracking-wider px-2 py-0.5">Routine</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={HelpCircle}
                  title="No Rankings Computed"
                  description="We don't have enough citizen suggestions to calculate priority rankings yet."
                  className="border-none"
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
