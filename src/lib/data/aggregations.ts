import {
  demoCampaigns,
  demoClients,
  demoElevraScores,
  demoKpiEntries,
  demoProfiles,
  demoTasks,
} from "@/lib/data/mock-data";
import { sumKpiEntries, calculateROI } from "@/lib/utils/calculations";
import type { Client, KpiEntry } from "@/lib/types/database";

export function getKpiEntriesForClient(clientId: string): KpiEntry[] {
  return demoKpiEntries[clientId] ?? [];
}

export function getAllKpiEntries(): KpiEntry[] {
  return Object.values(demoKpiEntries).flat();
}

export function getLatestWeekEntries(entries: KpiEntry[]): KpiEntry[] {
  if (entries.length === 0) return [];
  const latestEnd = entries.reduce((max, e) => (e.period_end > max ? e.period_end : max), entries[0].period_end);
  return entries.filter((e) => e.period_end === latestEnd);
}

export function getPreviousWeekEntries(entries: KpiEntry[]): KpiEntry[] {
  const uniqueEnds = Array.from(new Set(entries.map((e) => e.period_end))).sort();
  if (uniqueEnds.length < 2) return [];
  const previousEnd = uniqueEnds[uniqueEnds.length - 2];
  return entries.filter((e) => e.period_end === previousEnd);
}

export interface DashboardSummary {
  activeClients: number;
  weeklyLeads: number;
  weeklyLeadsGrowth: number | null;
  monthlyRevenue: number;
  monthlyInvestment: number;
  averageRoi: number | null;
  overdueTasks: number;
  activeCampaigns: number;
  leadsByWeek: { week: string; leads: number }[];
  revenueByWeek: { week: string; revenue: number }[];
  alerts: { id: string; message: string; tone: "warning" | "danger" }[];
}

export function getDashboardSummary(): DashboardSummary {
  const allEntries = getAllKpiEntries();
  const latest = getLatestWeekEntries(allEntries);
  const previous = getPreviousWeekEntries(allEntries);

  const latestTotals = sumKpiEntries(latest);
  const previousTotals = sumKpiEntries(previous);

  const weeklyLeadsGrowth =
    previousTotals.leads === 0
      ? null
      : ((latestTotals.leads - previousTotals.leads) / previousTotals.leads) * 100;

  const monthTotals = sumKpiEntries(allEntries);
  const roi = calculateROI(monthTotals.revenue, monthTotals.investment);

  const weekKeys = Array.from(new Set(allEntries.map((e) => e.period_end))).sort();
  const leadsByWeek = weekKeys.map((week) => ({
    week,
    leads: sumKpiEntries(allEntries.filter((e) => e.period_end === week)).leads,
  }));
  const revenueByWeek = weekKeys.map((week) => ({
    week,
    revenue: sumKpiEntries(allEntries.filter((e) => e.period_end === week)).revenue,
  }));

  const today = new Date();
  const overdueTasks = demoTasks.filter(
    (t) => t.status !== "concluida" && t.status !== "cancelada" && new Date(t.due_date) < today
  ).length;

  const activeCampaigns = demoCampaigns.filter((c) => c.status === "ativa").length;
  const activeClients = demoClients.filter((c) => c.status !== "encerrado").length;

  const alerts: DashboardSummary["alerts"] = [];

  demoClients.forEach((c) => {
    if (c.status === "em_risco") {
      alerts.push({
        id: `alert-risco-${c.id}`,
        message: `${c.company_name} está com status "em risco" — revisar estratégia.`,
        tone: "danger",
      });
    }
  });

  if (overdueTasks > 0) {
    alerts.push({
      id: "alert-overdue",
      message: `${overdueTasks} tarefa(s) atrasada(s) precisam de atenção.`,
      tone: "warning",
    });
  }

  demoClients.forEach((c) => {
    const entries = getKpiEntriesForClient(c.id);
    if (entries.length === 0) {
      alerts.push({
        id: `alert-nokpi-${c.id}`,
        message: `${c.company_name} não tem KPIs registrados ainda.`,
        tone: "warning",
      });
      return;
    }
    const latest = entries.reduce((max, e) => e.updated_at > max ? e.updated_at : max, entries[0].updated_at);
    const daysSince = (today.getTime() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) {
      alerts.push({
        id: `alert-kpi-${c.id}`,
        message: `${c.company_name} sem KPI atualizado há ${Math.floor(daysSince)} dias.`,
        tone: "warning",
      });
    }
  });

  demoClients.forEach((c) => {
    const entries = getKpiEntriesForClient(c.id);
    const totals = sumKpiEntries(entries);
    if (c.monthly_leads_goal > 0) {
      const progress = (totals.leads / c.monthly_leads_goal) * 100;
      if (progress < 50) {
        alerts.push({
          id: `alert-leads-${c.id}`,
          message: `${c.company_name} atingiu apenas ${progress.toFixed(0)}% da meta de leads.`,
          tone: "warning",
        });
      }
    }
  });

  return {
    activeClients,
    weeklyLeads: latestTotals.leads,
    weeklyLeadsGrowth,
    monthlyRevenue: monthTotals.revenue,
    monthlyInvestment: monthTotals.investment,
    averageRoi: roi,
    overdueTasks,
    activeCampaigns,
    leadsByWeek,
    revenueByWeek,
    alerts,
  };
}

export interface ClientOverview {
  current: ReturnType<typeof sumKpiEntries>;
  previous: ReturnType<typeof sumKpiEntries> | null;
  cpl: number | null;
  conversionRate: number | null;
  roi: number | null;
  roas: number | null;
  averageTicket: number | null;
  leadsGoalProgress: number | null;
  revenueGoalProgress: number | null;
  revenueGrowth: number | null;
}

export function getClientOverview(client: Client): ClientOverview {
  const entries = getKpiEntriesForClient(client.id);
  const latest = getLatestWeekEntries(entries);
  const previous = getPreviousWeekEntries(entries);

  const current = sumKpiEntries(latest);
  const previousTotals = previous.length > 0 ? sumKpiEntries(previous) : null;

  const monthTotals = sumKpiEntries(entries);

  return {
    current,
    previous: previousTotals,
    cpl: current.leads === 0 ? null : current.investment / current.leads,
    conversionRate: current.leads === 0 ? null : (current.sales / current.leads) * 100,
    roi: calculateROI(current.revenue, current.investment),
    roas: current.investment === 0 ? null : current.revenue / current.investment,
    averageTicket: current.sales === 0 ? null : current.revenue / current.sales,
    leadsGoalProgress:
      client.monthly_leads_goal === 0 ? null : (monthTotals.leads / client.monthly_leads_goal) * 100,
    revenueGoalProgress:
      client.monthly_revenue_goal === 0 ? null : (monthTotals.revenue / client.monthly_revenue_goal) * 100,
    revenueGrowth:
      previousTotals === null || previousTotals.revenue === 0
        ? null
        : ((current.revenue - previousTotals.revenue) / previousTotals.revenue) * 100,
  };
}

export interface ClientListItem extends Client {
  monthLeads: number;
  monthRevenue: number;
  score: number | null;
  responsible_name?: string | null;
}

export function getClientListItems(): ClientListItem[] {
  return demoClients.map((client) => {
    const entries = getKpiEntriesForClient(client.id);
    const totals = sumKpiEntries(entries);
    const score = demoElevraScores.find((s) => s.client_id === client.id);
    const responsible = demoProfiles.find((p) => p.id === client.responsible_profile_id);
    return {
      ...client,
      monthLeads: totals.leads,
      monthRevenue: totals.revenue,
      score: score ? score.overall_score : null,
      responsible_name: responsible?.full_name ?? null,
    };
  });
}
