"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency, formatDateShort } from "@/lib/utils/format";

interface RevenueChartProps {
  data: { week: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({ ...d, label: formatDateShort(d.week) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#1a2135" vertical={false} />
        <XAxis dataKey="label" stroke="#5b6379" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#5b6379"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => formatCurrency(v, { compact: true })}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
          contentStyle={{
            background: "#0e1322",
            border: "1px solid #262f47",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#8d97b0" }}
          cursor={{ fill: "rgba(61,125,255,0.06)" }}
        />
        <Bar dataKey="revenue" fill="#3d7dff" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
