import type { ClientRevenue } from "@/lib/types/database";

export const clientCommissionPct: Record<string, number> = {
  "client-semper-fidelis": 10,
  "client-autoforce": 8,
  "client-rose-lopes": 12,
};

export const demoRevenues: ClientRevenue[] = [
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
    .reduce((sum, r) => sum + r.commission_value, 0);

  const totalPrevMonth = prev
    .filter((r) => r.status === "confirmado")
    .reduce((sum, r) => sum + r.commission_value, 0);

  return {
    previsto,
    confirmado,
    total: previsto + confirmado,
    prevMonth: totalPrevMonth,
  };
}