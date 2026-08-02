import Link from "next/link";
import { Users, TrendingUp, DollarSign, Target, AlertTriangle, Megaphone, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LeadsChart } from "@/components/charts/LeadsChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { getDashboardSummary, getClientListItems } from "@/lib/data/aggregations";
import { demoTasks } from "@/lib/data/mock-data";
import { clientStatusLabels, taskPriorityLabels } from "@/lib/labels";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Clientes reais ou mock
  let clients = getClientListItems();
  if (supabase) {
    const { data } = await supabase.from("clients").select("*").order("company_name");
    if (data && data.length > 0) {
      clients = data.map((c) => ({ ...c, monthLeads: 0, monthRevenue: 0, score: null }));
    }
  }

  // Receitas reais
  let revSummary = { previsto: 0, confirmado: 0, total: 0, prevMonth: 0 };
  if (supabase) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);

    const { data: revenues } = await supabase
      .from("client_revenues")
      .select("commission_value, status, month");

    if (revenues) {
      const current = revenues.filter((r) => r.month === currentMonth);
      const prev = revenues.filter((r) => r.month === prevMonthStr);
      revSummary = {
        previsto:   current.filter((r) => r.status === "previsto").reduce((s, r) => s + r.commission_value, 0),
        confirmado: current.filter((r) => r.status === "confirmado").reduce((s, r) => s + r.commission_value, 0),
        total:      current.reduce((s, r) => s + r.commission_value, 0),
        prevMonth:  prev.reduce((s, r) => s + r.commission_value, 0),
      };
    }
  }

  const summary = getDashboardSummary();
  const upcomingTasks = [...demoTasks]
    .filter((t) => t.status !== "concluida" && t.status !== "cancelada")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard geral"
        description="Panorama consolidado de todos os clientes da Elevra Digital."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Clientes ativos"
          value={formatNumber(clients.filter((c) => c.status === "ativo").length)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Leads na semana"
          value={formatNumber(summary.weeklyLeads)}
          delta={summary.weeklyLeadsGrowth === null ? null : {
            value: formatPercent(summary.weeklyLeadsGrowth, { showSign: true }),
            positive: summary.weeklyLeadsGrowth >= 0,
          }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Receita no mês"
          value={formatCurrency(summary.monthlyRevenue, { compact: true })}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Investimento em marketing"
          value={formatCurrency(summary.monthlyInvestment, { compact: true })}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="ROI médio"
          value="—"
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        />
        <StatCard
          label="Tarefas atrasadas"
          value={formatNumber(summary.overdueTasks)}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Campanhas ativas"
          value={formatNumber(summary.activeCampaigns)}
          icon={<Megaphone className="h-4 w-4" />}
        />
        <Card>
          <CardContent className="pt-4 flex flex-col gap-1 h-full justify-center">
            <span className="text-xs text-text-muted">Alertas importantes</span>
            {summary.alerts.length === 0 ? (
              <span className="text-xs text-text-muted">Nenhum alerta no momento.</span>
            ) : (
              <ul className="flex flex-col gap-1">
                {summary.alerts.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-start gap-1.5 text-[11px]">
                    <span className={a.tone === "danger" ? "text-danger" : "text-warning"}>●</span>
                    <span className="text-text-secondary leading-tight">{a.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bloco financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-accent/30 bg-accent-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase tracking-widest">Comissão total do mês</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(revSummary.total)}</span>
            <span className="text-xs text-text-muted">vs {formatCurrency(revSummary.prevMonth)} mês anterior</span>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-warning uppercase tracking-widest font-semibold">Previsto</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(revSummary.previsto)}</span>
            <span className="text-xs text-text-muted">Aguardando confirmação</span>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-success uppercase tracking-widest font-semibold">Confirmado</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(revSummary.confirmado)}</span>
            <span className="text-xs text-text-muted">Já garantido</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Leads por semana</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <LeadsChart data={summary.weeklyLeadsChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Receita mensal</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <RevenueChart data={summary.monthlyRevenueChart} />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <Link href="/clients" className="text-xs text-accent hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              {clients.slice(0, 5).map((c) => {
                const st = clientStatusLabels[c.status];
                return (
                  <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between py-2.5 hover:bg-surface-raised px-2 rounded-lg transition-colors">
                    <span className="text-sm text-text-primary">{c.company_name}</span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </Link>
                );
              })}
              {clients.length === 0 && (
                <p className="text-sm text-text-muted py-4 text-center">Nenhum cliente cadastrado ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas próximas</CardTitle>
            <Link href="/tasks" className="text-xs text-accent hover:underline">Ver todas</Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              {upcomingTasks.map((t) => {
                const p = taskPriorityLabels[t.priority];
                return (
                  <div key={t.id} className="flex items-center justify-between py-2.5 px-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-text-primary truncate">{t.title}</span>
                      <span className="text-[11px] text-text-muted">{formatDate(t.due_date)}</span>
                    </div>
                    <Badge tone={p.tone}>{p.label}</Badge>
                  </div>
                );
              })}
              {upcomingTasks.length === 0 && (
                <p className="text-sm text-text-muted py-4 text-center">Nenhuma tarefa pendente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}