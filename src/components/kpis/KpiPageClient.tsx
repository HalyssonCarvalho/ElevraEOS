"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiForm } from "@/components/kpis/KpiForm";
import { MetricCard } from "@/components/clients/MetricCard";
import type { KpiEntry } from "@/lib/types/database";
import {
  calculateAverageTicket,
  calculateCPL,
  calculateLeadToSaleRate,
  calculateROAS,
  calculateROI,
  sumKpiEntries,
} from "@/lib/utils/calculations";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/utils/format";

export function KpiPageClient({
  clientId,
  initialEntries,
}: {
  clientId: string;
  initialEntries: KpiEntry[];
}) {
  const [entries, setEntries] = useState<KpiEntry[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);

  const totals = useMemo(() => sumKpiEntries(entries), [entries]);
  const cpl = calculateCPL(totals.investment, totals.leads);
  const conv = calculateLeadToSaleRate(totals.sales, totals.leads);
  const roi = calculateROI(totals.revenue, totals.investment);
  const roas = calculateROAS(totals.revenue, totals.investment);
  const ticket = calculateAverageTicket(totals.revenue, totals.sales);

  const sorted = [...entries].sort((a, b) => b.period_end.localeCompare(a.period_end));

  function handleAdd(entry: KpiEntry) {
    setEntries((prev) => [entry, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="KPIs"
        description="Registre métricas por dia, semana ou mês. Os indicadores abaixo são calculados automaticamente."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Fechar formulário" : "Registrar KPI"}
          </Button>
        }
      />

      {showForm && <KpiForm clientId={clientId} onAdd={handleAdd} />}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard label="CPL" value={cpl === null ? "—" : formatCurrency(cpl)} />
        <MetricCard label="Conversão lead → venda" value={conv === null ? "—" : formatPercent(conv)} />
        <MetricCard label="ROI" value={roi === null ? "—" : formatPercent(roi)} />
        <MetricCard label="ROAS" value={roas === null ? "—" : `${roas.toFixed(2)}x`} />
        <MetricCard label="Ticket médio" value={ticket === null ? "—" : formatCurrency(ticket)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de registros</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {sorted.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6" />}
              title="Nenhum KPI registrado"
              description="Registre o primeiro KPI deste cliente para começar a acompanhar os resultados."
            />
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="text-left text-[11px] text-text-muted border-y border-border">
                    <th className="font-medium px-5 py-2.5">Período</th>
                    <th className="font-medium px-3 py-2.5">Canal</th>
                    <th className="font-medium px-3 py-2.5 text-right">Invest.</th>
                    <th className="font-medium px-3 py-2.5 text-right">Leads</th>
                    <th className="font-medium px-3 py-2.5 text-right">Vendas</th>
                    <th className="font-medium px-3 py-2.5 text-right">Receita</th>
                    <th className="font-medium px-3 py-2.5 text-right">CPL</th>
                    <th className="font-medium px-3 py-2.5 text-right">ROI</th>
                    <th className="font-medium px-5 py-2.5 text-right">Ticket médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sorted.map((e) => {
                    const rowCpl = calculateCPL(e.investment, e.leads);
                    const rowRoi = calculateROI(e.revenue, e.investment);
                    return (
                      <tr key={e.id} className="hover:bg-surface-hover">
                        <td className="px-5 py-2.5 text-text-primary whitespace-nowrap">
                          {formatDate(e.period_start)} – {formatDate(e.period_end)}
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary">{e.channel}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                          {formatCurrency(e.investment)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                          {formatNumber(e.leads)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                          {formatNumber(e.sales)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-text-primary font-medium">
                          {formatCurrency(e.revenue)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                          {rowCpl === null ? "—" : formatCurrency(rowCpl)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                          {rowRoi === null ? "—" : formatPercent(rowRoi)}
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-text-secondary">
                          {formatCurrency(e.average_ticket)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
