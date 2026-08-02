"use client";

import { useState } from "react";
import { Clock, CheckCircle2, TrendingDown, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RevenueForm } from "@/components/revenue/RevenueForm";
import type { ClientRevenue } from "@/lib/types/database";
import { demoClients } from "@/lib/data/mock-data";
import { demoRevenues } from "@/lib/data/mock-revenue";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const statusConfig = {
  previsto:   { label: "Previsto",   tone: "warning" as const, icon: Clock },
  confirmado: { label: "Confirmado", tone: "success" as const, icon: CheckCircle2 },
  cancelado:  { label: "Cancelado",  tone: "danger"  as const, icon: TrendingDown },
};

export function RevenueDashboard() {
  const [revenues, setRevenues] = useState<ClientRevenue[]>(demoRevenues);
  const [showForm, setShowForm] = useState(false);
  const currentMonth = "2026-07";
  const current = revenues.filter((r) => r.month === currentMonth);
  const prev = revenues.filter((r) => r.month === "2026-06");

  const previsto   = current.filter((r) => r.status === "previsto").reduce((s, r) => s + r.commission_value, 0);
  const confirmado = current.filter((r) => r.status === "confirmado").reduce((s, r) => s + r.commission_value, 0);
  const total      = previsto + confirmado;
  const totalPrev  = prev.filter((r) => r.status === "confirmado").reduce((s, r) => s + r.commission_value, 0);

  function toggleStatus(id: string) {
    setRevenues((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = r.status === "previsto" ? "confirmado" : "previsto";
        return { ...r, status: next };
      })
    );
  }

  function handleSave(revenue: ClientRevenue) {
    setRevenues((prev) => [...prev, revenue]);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Botão novo lançamento */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Lançar receita
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <RevenueForm onSave={handleSave} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase tracking-widest">Total do mês</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(total)}</span>
            <span className="text-xs text-text-muted">vs {formatCurrency(totalPrev)} mês anterior</span>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning-soft/30">
          <CardContent className="pt-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-warning uppercase tracking-widest font-semibold">Previsto</span>
            </div>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(previsto)}