import { notFound } from "next/navigation";
import { Gauge } from "lucide-react";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById, demoClientExtras, demoElevraScores } from "@/lib/data/mock-data";
import { getClientOverview, getKpiEntriesForClient } from "@/lib/data/aggregations";
import { MetricCard } from "@/components/clients/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadsChart } from "@/components/charts/LeadsChart";
import { ExportPdfButton } from "@/components/reports/ExportPdfButton";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/server";

export default async function ClientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
  if (!client) notFound();

  const supabase = await createClient();
  let entries = getKpiEntriesForClient(id);

  if (supabase) {
    const { data } = await supabase
      .from("kpi_entries")
      .select("*")
      .eq("client_id", id)
      .order("period_end", { ascending: false });
    if (data && data.length > 0) entries = data;
  }

  const overview = getClientOverview(client, entries);
  const extras = demoClientExtras[id];
  const score = demoElevraScores.find((s) => s.client_id === id);

  const leadsByWeek = Array.from(new Set(entries.map((e) => e.period_end)))
    .sort()
    .map((week) => ({
      week,
      leads: entries.filter((e) => e.period_end === week).reduce((sum, e) => sum + e.leads, 0),
    }));

  const metrics = {
    leads:          overview.current.leads,
    revenue:        overview.current.revenue,
    investment:     overview.current.investment,
    sales:          overview.current.sales,
    cpl:            overview.cpl,
    roi:            overview.roi,
    conversionRate: overview.conversionRate,
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <ExportPdfButton client={client} metrics={metrics} score={null} />
        </div>
        <EmptyState
          title="Nenhum dado registrado ainda"
          description="Registre os primeiros KPIs deste cliente para começar a acompanhar os resultados."
          action={
            <Button href={`/clients/${id}/kpis`} size="sm">
              Registrar KPIs
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <ExportPdfButton client={client} metrics={metrics} score={score ? score.overall_score : null} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Leads (última semana)" value={formatNumber(overview.current.leads)} previousValue={overview.previous ? formatNumber(overview.previous.leads) : null} />
        <MetricCard label="Agendamentos" value={formatNumber(overview.current.appointments)} />
        <MetricCard label="Vendas" value={formatNumber(overview.current.sales)} />
        <MetricCard label="Receita" value={formatCurrency(overview.current.revenue, { compact: true })} previousValue={overview.previous ? formatCurrency(overview.previous.revenue, { compact: true }) : null} variation={overview.revenueGrowth} />
        <MetricCard label="Investimento" value={formatCurrency(overview.current.investment, { compact: true })} />
        <MetricCard label="Custo por lead" value={overview.cpl === null ? "—" : formatCurrency(overview.cpl)} />
        <MetricCard label="Taxa de conversão" value={overview.conversionRate === null ? "—" : formatPercent(overview.conversionRate)} />
        <MetricCard label="Ticket médio" value={overview.averageTicket === null ? "—" : formatCurrency(overview.averageTicket)} />
        <MetricCard label="ROI" value={overview.roi === null ? "—" : formatPercent(overview.roi)} />
        <MetricCard label="ROAS" value={overview.roas === null ? "—" : `${overview.roas.toFixed(2)}x`} />
        <MetricCard label="Google Reviews" value={extras ? `${extras.googleRating.toFixed(1)} ★ (${extras.googleReviewsCount})` : "—"} />
        <MetricCard label="Tempo médio de resposta" value={extras ? `${extras.avgResponseMinutes} min` : "—"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Leads por semana</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <LeadsChart data={leadsByWeek} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metas do mês</CardTitle></CardHeader>
          <CardContent className="pt-3 flex flex-col gap-4">
            <GoalBar label="Leads" progress={overview.leadsGoalProgress} goalLabel={`Meta: ${formatNumber(client.monthly_leads_goal)}`} />
            <GoalBar label="Receita" progress={overview.revenueGoalProgress} goalLabel={`Meta: ${formatCurrency(client.monthly_revenue_goal, { compact: true })}`} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Elevra</CardTitle>
          <Button href={`/clients/${id}/score`} variant="secondary" size="sm">
            <Gauge className="h-3.5 w-3.5" />
            Ver score completo
          </Button>
        </CardHeader>
        <CardContent className="pt-3">
          {score ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex flex-col items-center justify-center shrink-0">
                <span className="text-3xl font-semibold tabular-nums">{score.overall_score.toFixed(0)}</span>
                <span className="text-[11px] text-text-muted">de 100</span>
              </div>
              <p className="text-sm text-text-secondary flex-1">{score.recommended_action_plan}</p>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Nenhuma avaliação registrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoalBar({ label, progress, goalLabel }: { label: string; progress: number | null; goalLabel: string; }) {
  const pct = progress === null ? 0 : Math.min(100, Math.max(0, progress));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-muted">{goalLabel}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-text-muted">
        {progress === null ? "Sem meta definida" : `${progress.toFixed(0)}% da meta`}
      </span>
    </div>
  );
}