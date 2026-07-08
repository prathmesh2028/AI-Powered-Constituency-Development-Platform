"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend
} from "recharts";

// ── 1. Category Bar Chart ────────────────────────────────
interface BarChartProps {
  data: Array<{ name: string; count: number; fill: string }>;
}

export function CategoryBarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38a9f8" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="slateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#475569" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0b0f19",
            borderColor: "rgba(255,255,255,0.06)",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "11px"
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 2. Trend Area Chart ─────────────────────────────────
interface AreaChartProps {
  data: Array<{ month: string; suggestions: number }>;
}

export function TrendAreaChart({ data }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0b0f19",
            borderColor: "rgba(255,255,255,0.06)",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "11px"
          }}
        />
        <Area type="monotone" dataKey="suggestions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#areaGrad)" activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── 3. Category Pie Chart ───────────────────────────────
interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
}

export function CategoryPieChart({ data, colors }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={75}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, idx) => (
            <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#0b0f19",
            borderColor: "rgba(255,255,255,0.06)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "11px"
          }}
        />
        <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
