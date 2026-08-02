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
import { getDashboardRevenueSummary } from "@/lib/data/mock-revenue";
import { demoRevenues } from "@/lib/data/mock-revenue";

export default function DashboardPage() {
  const summary = getDashboardSummary();
  const clients = getClientListItems();
  const revSummary = getDashboardRevenueSummary();
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
          value={formatNumber(summary.activeClients)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Leads na semana"
          value={formatNumber(summary.weeklyLeads)}
          delta={
            summary.weeklyLeadsGrowth === null
              ? null
              : { value: formatPercent(summary.weeklyLeadsGrowth, { showSign: true }), positive: summary.weeklyLeadsGrowth >= 0 }
          }
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
          value={summary.averageRoi === null ? "—" : formatPercent(summary.averageRoi)}
          icon={<ArrowUpRight className="h-4 w-4" />}
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
        <Card className="p-5 flex flex-col gap-2.5">
          <span className="text-xs font-medium text-text-secondary">Alertas importantes</span>
          {summary.alerts.length === 0 ? (
            <span className="text-xs text-text-muted">Nenhum alerta no momento.</span>
          ) : (
            <div className="flex flex-col gap-1.5">
              {summary.alerts.slice(0, 2).map((a) => (
                <div key={a.id} className="flex items-start gap-1.5 text-[11px] text-text-secondary">
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${a.tone === "danger" ? "bg-danger" : "bg-warning"}`} />
                  {a.message}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      {/* Bloco financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-accent/30 bg-accent-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase tracking-widest">Comissão total do mês</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">
              {formatCurrency(revSummary.total)}
            </span>
            <span className="text-xs text-text-muted">vs {formatCurrency(revSummary.prevMonth)} mês anterior</span>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-warning uppercase tracking-widest font-semibold">Previsto</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">
              {formatCurrency(revSummary.previsto)}
            </span>
            <span className="text-xs text-text-muted">Aguardando confirmação</span>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-success uppercase tracking-widest font-semibold">Confirmado</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">
              {formatCurrency(revSummary.confirmado)}
            </span>
            <span className="text-xs text-text-muted">Já garantido</span>
          </CardContent>
        </Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Leads por semana</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <LeadsChart data={summary.leadsByWeek} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receita mensal</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <RevenueChart data={summary.revenueByWeek} />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <Link href="/clients" className="text-xs text-accent hover:text-accent-hover font-medium">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex flex-col divide-y divide-border">
              {clients.map((c) => {
                const status = clientStatusLabels[c.status];
                return (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-surface-hover -mx-1 px-1 rounded-md transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{c.company_name}</p>
                      <p className="text-xs text-text-muted truncate">{c.segment}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden sm:block text-xs text-text-secondary tabular-nums">
                        {formatCurrency(c.monthRevenue, { compact: true })}
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas tarefas</CardTitle>
            <Link href="/tasks" className="text-xs text-accent hover:text-accent-hover font-medium">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex flex-col divide-y divide-border">
              {upcomingTasks.map((t) => {
                const priority = taskPriorityLabels[t.priority];
                return (
                  <div key={t.id} className="py-3 flex flex-col gap-1.5">
                    <p className="text-sm text-text-primary leading-snug">{t.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge tone={priority.tone}>{priority.label}</Badge>
                      <span className="text-[11px] text-text-muted">
                        Entrega {formatDate(t.due_date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
