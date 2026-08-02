"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, TrendingDown, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RevenueForm } from "@/components/revenue/RevenueForm";
import type { ClientRevenue } from "@/lib/types/database";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

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
  const [revenues, setRevenues] = useState<ClientRevenue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenues() {
      const supabase = isSupabaseConfigured() ? createClient() : null;
      if (supabase) {
        const { data } = await supabase
          .from("client_revenues")
          .select("*")
          .order("month", { ascending: false });
        if (data) setRevenues(data);
      }
      setLoading(false);
    }
    fetchRevenues();
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const current = revenues.filter((r) => r.month === currentMonth);
  const history = revenues.filter((r) => r.month !== currentMonth);

  const previsto   = current.filter((r) => r.status === "previsto").reduce((s, r) => s + r.commission_value, 0);
  const confirmado = current.filter((r) => r.status === "confirmado").reduce((s, r) => s + r.commission_value, 0);
  const total      = previsto + confirmado;

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
    setRevenues((prev) => [revenue, ...prev]);
    setShowForm(false);
  }

  if (loading) {
    return <div className="text-sm text-text-muted">Carregando receitas...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Lançar receita
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <RevenueForm onSave={handleSave} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase tracking-widest">Total do mês</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(total)}</span>
            <span className="text-xs text-text-muted">{currentMonth}</span>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning-soft/30">
          <CardContent className="pt-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-warning uppercase tracking-widest font-semibold">Previsto</span>
            </div>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(previsto)}</span>
            <span className="text-xs text-text-muted">Aguardando confirmação</span>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success-soft/30">
          <CardContent className="pt-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-success uppercase tracking-widest font-semibold">Confirmado</span>
            </div>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(confirmado)}</span>
            <span className="text-xs text-text-muted">Já garantido</span>
          </CardContent>
        </Card>
      </div>

      {current.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comissões — {currentMonth}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              <div className="grid grid-cols-4 gap-2 px-2 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                <span className="col-span-1">Cliente</span>
                <span className="text-right">Receita gerada</span>
                <span className="text-right">Comissão</span>
                <span className="text-right">Status</span>
              </div>
              {current.map((rev) => {
                const st = statusConfig[rev.status] ?? statusConfig.previsto;
                const Icon = st.icon;
                return (
                  <div key={rev.id} className="grid grid-cols-4 gap-2 px-2 py-3 items-center hover:bg-surface-raised transition-colors rounded-lg">
                    <span className="text-sm font-medium text-text-primary truncate">{rev.client_id}</span>
                    <span className="text-sm text-right tabular-nums text-text-secondary">{formatCurrency(rev.revenue_generated)}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-text-primary tabular-nums">{formatCurrency(rev.commission_value)}</span>
                      <span className="text-[11px] text-text-muted">{rev.commission_pct}%</span>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => toggleStatus(rev.id)}>
                        <Badge tone={st.tone}>
                          <Icon className="h-3 w-3 mr-1" />
                          {st.label}
                        </Badge>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              <div className="grid grid-cols-4 gap-2 px-2 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                <span>Mês</span>
                <span>Cliente</span>
                <span className="text-right">Comissão</span>
                <span className="text-right">Status</span>
              </div>
              {history.map((rev) => {
                const st = statusConfig[rev.status] ?? statusConfig.previsto;
                const Icon = st.icon;
                return (
                  <div key={rev.id} className="grid grid-cols-4 gap-2 px-2 py-3 items-center hover:bg-surface-raised rounded-lg">
                    <span className="text-sm text-text-secondary">{rev.month}</span>
                    <span className="text-sm text-text-primary truncate">{rev.client_id}</span>
                    <span className="text-sm text-right tabular-nums font-semibold">{formatCurrency(rev.commission_value)}</span>
                    <div className="flex justify-end">
                      <Badge tone={st.tone}><Icon className="h-3 w-3 mr-1" />{st.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {revenues.length === 0 && !showForm && (
        <div className="text-center py-12 text-sm text-text-muted">
          Nenhuma receita lançada ainda. Clique em "Lançar receita" para começar.
        </div>
      )}
    </div>
  );
}