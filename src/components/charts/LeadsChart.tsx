"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatDateShort, formatNumber } from "@/lib/utils/format";

interface LeadsChartProps {
  data: { week: string; leads: number }[];
}

export function LeadsChart({ data }: LeadsChartProps) {
  const chartData = data.map((d) => ({ ...d, label: formatDateShort(d.week) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d7dff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3d7dff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1a2135" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#5b6379"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#5b6379" fontSize={11} tickLine={false} axisLine={false} width={32} />
        <Tooltip
          formatter={(value) => [formatNumber(Number(value)), "Leads"]}
          contentStyle={{
            background: "#0e1322",
            border: "1px solid #262f47",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#8d97b0" }}
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="#3d7dff"
          strokeWidth={2}
          fill="url(#leadsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
