import type { ClientRevenue } from "@/lib/types/database";

// % acordado por cliente
export const clientCommissionPct: Record<string, number> = {
  "client-semper-fidelis": 10,
  "client-autoforce": 8,
  "client-rose-lopes": 12,
};

export const demoRevenues: ClientRevenue[] = [
  // Semper Fidelis
  {
    id: "rev-1",
    client_id: "client-semper-fidelis",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-05",
    revenue_generated: 38000,
    commission_pct: 10,
    commission_value: 3800,
    status: "confirmado",
    notes: null,
    created_by: "p-consultor-1",
    created_at: "2026-05-31T10:00:00.000Z",
    updated_at: "2026-05-31T10:00:00.000Z",
  },
  {
    id: "rev-2",
    client_id: "client-semper-fidelis",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-06",
    revenue_generated: 42000,
    commission_pct: 10,
    commission_value: 4200,
    status: "confirmado",
    notes: null,
    created_by: "p-consultor-1",
    created_at: "2026-06-30T10:00:00.000Z",
    updated_at: "2026-06-30T10:00:00.000Z",
  },
  {
    id: "rev-3",
    client_id: "client-semper-fidelis",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-07",
    revenue_generated: 45000,
    commission_pct: 10,
    commission_value: 4500,
    status: "previsto",
    notes: "Aguardando fechamento do mês",
    created_by: "p-consultor-1",
    created_at: "2026-07-01T10:00:00.000Z",
    updated_at: "2026-07-01T10:00:00.000Z",
  },
  // AutoForce
  {
    id: "rev-4",
    client_id: "client-autoforce",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-05",
    revenue_generated: 165000,
    commission_pct: 8,
    commission_value: 13200,
    status: "confirmado",
    notes: null,
    created_by: "p-consultor-2",
    created_at: "2026-05-31T10:00:00.000Z",
    updated_at: "2026-05-31T10:00:00.000Z",
  },
  {
    id: "rev-5",
    client_id: "client-autoforce",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-06",
    revenue_generated: 172000,
    commission_pct: 8,
    commission_value: 13760,
    status: "confirmado",
    notes: null,
    created_by: "p-consultor-2",
    created_at: "2026-06-30T10:00:00.000Z",
    updated_at: "2026-06-30T10:00:00.000Z",
  },
  {
    id: "rev-6",
    client_id: "client-autoforce",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-07",
    revenue_generated: 180000,
    commission_pct: 8,
    commission_value: 14400,
    status: "previsto",
    notes: "Aguardando confirmação do cliente",
    created_by: "p-consultor-2",
    created_at: "2026-07-01T10:00:00.000Z",
    updated_at: "2026-07-01T10:00:00.000Z",
  },
  // Rose Lopes
  {
    id: "rev-7",
    client_id: "client-rose-lopes",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-06",
    revenue_generated: 85000,
    commission_pct: 12,
    commission_value: 10200,
    status: "confirmado",
    notes: null,
    created_by: "p-admin-1",
    created_at: "2026-06-30T10:00:00.000Z",
    updated_at: "2026-06-30T10:00:00.000Z",
  },
  {
    id: "rev-8",
    client_id: "client-rose-lopes",
    organization_id: "00000000-0000-0000-0000-000000000001",
    month: "2026-07",
    revenue_generated: 90000,
    commission_pct: 12,
    commission_value: 10800,
    status: "previsto",
    notes: null,
    created_by: "p-admin-1",
    created_at: "2026-07-01T10:00:00.000Z",
    updated_at: "2026-07-01T10:00:00.000Z",
  },
];

export function getRevenuesForClient(clientId: string): ClientRevenue[] {
  return demoRevenues.filter((r) => r.client_id === clientId);
}

export function getRevenuesByMonth(month: string): ClientRevenue[] {
  return demoRevenues.filter((r) => r.month === month);
}

export function getCommissionPct(clientId: string): number {
  return clientCommissionPct[clientId] ?? 0;
}

export function getDashboardRevenueSummary() {
  const currentMonth = "2026-07";
  const prevMonth = "2026-06";

  const current = demoRevenues.filter((r) => r.month === currentMonth);
  const prev = demoRevenues.filter((r) => r.month === prevMonth);

  const previsto = current
    .filter((r) => r.status === "previsto")
    .reduce((sum, r) => sum + r.commission_value, 0);

  const confirmado = current
    .filter((r) => r.status === "confirmado")
    .reduce((sum, r) => sum +
cat > src/components/revenue/RevenueDashboard.tsx << 'EOF'
"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import type { ClientRevenue } from "@/lib/types/database";
import { demoClients } from "@/lib/data/mock-data";
import { getDashboardRevenueSummary, demoRevenues } from "@/lib/data/mock-revenue";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

const statusConfig = {
  previsto:   { label: "Previsto",   tone: "warning" as const, icon: Clock },
  confirmado: { label: "Confirmado", tone: "success" as const, icon: CheckCircle2 },
  cancelado:  { label: "Cancelado",  tone: "danger"  as const, icon: TrendingDown },
};

export function RevenueDashboard() {
  const [revenues, setRevenues] = useState<ClientRevenue[]>(demoRevenues);
  const summary = getDashboardRevenueSummary();

  const currentMonth = "2026-07";
  const currentRevenues = revenues.filter((r) => r.month === currentMonth);

  const previsto   = currentRevenues.filter((r) => r.status === "previsto").reduce((s, r) => s + r.commission_value, 0);
  const confirmado = currentRevenues.filter((r) => r.status === "confirmado").reduce((s, r) => s + r.commission_value, 0);
  const total      = previsto + confirmado;

  function toggleStatus(id: string) {
    setRevenues((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const next = r.status === "previsto" ? "confirmado" : r.status === "confirmado" ? "previsto" : r.status;
      const newVal = r.revenue_generated * r.commission_pct / 100;
      return { ...r, status: next, commission_value: newVal };
    }));
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase tracking-widest">Total do mês</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(total)}</span>
            <span className="text-xs text-text-muted">Previsto + Confirmado</span>
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

      {/* Tabela por cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões por cliente — Julho 2026</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col divide-y divide-border">

            {/* Header */}
            <div className="grid grid-cols-5 gap-2 px-2 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
              <span className="col-span-2">Cliente</span>
              <span className="text-right">Receita gerada</span>
              <span className="text-right">% / Comissão</span>
              <span className="text-right">Status</span>
            </div>

            {currentRevenues.map((rev) => {
              const client = demoClients.find((c) => c.id === rev.client_id);
              const st = statusConfig[rev.status];
              const Icon = st.icon;
              return (
                <div key={rev.id} className="grid grid-cols-5 gap-2 px-2 py-3 items-center hover:bg-surface-raised transition-colors rounded-lg">
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-text-primary">{client?.company_name ?? rev.client_id}</span>
                    {rev.notes && <p className="text-[11px] text-text-muted mt-0.5">{rev.notes}</p>}
                  </div>
                  <span className="text-sm text-right tabular-nums text-text-secondary">{formatCurrency(rev.revenue_generated)}</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-text-primary tabular-nums">{formatCurrency(rev.commission_value)}</span>
                    <span className="text-[11px] text-text-muted">{formatPct(rev.commission_pct)} do resultado</span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => toggleStatus(rev.id)}
                      title="Clique para alternar entre previsto e confirmado"
                      className="cursor-pointer"
                    >
                      <Badge tone={st.tone}>
                        <Icon className="h-3 w-3 mr-1" />
                        {st.label}
                      </Badge>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="grid grid-cols-5 gap-2 px-2 py-3 items-center">
              <div className="col-span-2">
                <span className="text-sm font-bold text-text-primary">TOTAL</span>
              </div>
              <span className="text-sm text-right tabular-nums font-semibold text-text-secondary">
                {formatCurrency(currentRevenues.reduce((s, r) => s + r.revenue_generated, 0))}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-text-primary tabular-nums">{formatCurrency(total)}</span>
              </div>
              <div />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de comissões</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col divide-y divide-border">
            <div className="grid grid-cols-4 gap-2 px-2 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
              <span>Mês</span>
              <span>Cliente</span>
              <span className="text-right">Comissão</span>
              <span className="text-right">Status</span>
            </div>
            {revenues
              .filter((r) => r.month !== currentMonth)
              .sort((a, b) => b.month.localeCompare(a.month))
              .map((rev) => {
                const client = demoClients.find((c) => c.id === rev.client_id);
                const st = statusConfig[rev.status];
                const Icon = st.icon;
                return (
                  <div key={rev.id} className="grid grid-cols-4 gap-2 px-2 py-3 items-center hover:bg-surface-raised rounded-lg">
                    <span className="text-sm text-text-secondary">{rev.month}</span>
                    <span className="text-sm text-text-primary">{client?.company_name ?? rev.client_id}</span>
                    <span className="text-sm text-right tabular-nums font-semibold text-text-primary">{formatCurrency(rev.commission_value)}</span>
                    <div className="flex justify-end">
                      <Badge tone={st.tone}>
                        <Icon className="h-3 w-3 mr-1" />
                        {st.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
