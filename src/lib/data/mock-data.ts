// ---------------------------------------------------------------------------
// DADOS DE DEMONSTRAÇÃO
// ---------------------------------------------------------------------------
// Este arquivo contém dados fictícios usados enquanto nenhum projeto
// Supabase real está conectado (ver src/lib/data/repository.ts). Assim que
// NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estiverem
// configurados e o schema em /supabase/schema.sql aplicado, a camada de
// repositório passa a consultar o banco real automaticamente.
// Todas as métricas abaixo são simuladas e claramente identificadas como
// demonstração — não representam dados reais de clientes.
// ---------------------------------------------------------------------------

import type {
  Campaign,
  Client,
  ContentCalendarItem,
  ElevraScore,
  KpiEntry,
  Task,
  WeeklyReport,
} from "@/lib/types/database";

export const DEMO_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000001";

export const demoProfiles = [
  { id: "p-admin-1", full_name: "Halysson Albert", email: "halysson.albert@gmail.com", role: "admin" as const },
  { id: "p-consultor-1", full_name: "Alisson Marcondes", email: "alissonmarcondees@gmail.com", role: "consultor" as const },
  { id: "p-consultor-2", full_name: "Bianca Ferraz", email: "bianca@elevra.digital", role: "consultor" as const },
];

export const demoClients: Client[] = [];

function buildWeeklyKpis(
  clientId: string,
  channel: string,
  weeks: { start: string; end: string; investment: number; leads: number; sales: number; revenue: number; impressions: number; reach: number; clicks: number; appointments: number; quotes: number; reviews: number }[]
): KpiEntry[] {
  return weeks.map((w, i) => ({
    id: `${clientId}-${channel}-${i}`,
    client_id: clientId,
    period_type: "semana",
    period_start: w.start,
    period_end: w.end,
    channel,
    investment: w.investment,
    impressions: w.impressions,
    reach: w.reach,
    clicks: w.clicks,
    leads: w.leads,
    appointments: w.appointments,
    quotes: w.quotes,
    sales: w.sales,
    revenue: w.revenue,
    average_ticket: w.sales > 0 ? Math.round(w.revenue / w.sales) : 0,
    reviews: w.reviews,
    notes: null,
    created_by: "p-consultor-1",
    created_at: w.start,
    updated_at: w.end,
  }));
}

export const demoKpiEntries: Record<string, KpiEntry[]> = {};

export const demoCampaigns: Campaign[] = [];

export const demoContentCalendar: ContentCalendarItem[] = [];

export const demoTasks: Task[] = [];

export const demoWeeklyReports: WeeklyReport[] = [];

export const demoElevraScores: ElevraScore[] = [];

// Indicadores operacionais que ainda não têm uma tabela dedicada no schema
// (ex: tempo médio de resposta, nota do Google). Por ora ficam como dados
// de demonstração; quando a operação real precisar deles, valem uma tabela
// própria (ex: `service_metrics`) ligada a `clients`.
export const demoClientExtras: Record<
  string,
  { googleRating: number; googleReviewsCount: number; avgResponseMinutes: number }
> = {
  "client-semper-fidelis": { googleRating: 4.8, googleReviewsCount: 214, avgResponseMinutes: 12 },
  "client-autoforce": { googleRating: 4.4, googleReviewsCount: 587, avgResponseMinutes: 42 },
  "client-rose-lopes": { googleRating: 4.9, googleReviewsCount: 63, avgResponseMinutes: 25 },
};

export function getClientById(id: string): Client | undefined {
  return demoClients.find((c) => c.id === id);
}
