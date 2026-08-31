export type LeadStage = "novo" | "contactado" | "proposta" | "fechado" | "perdido";

export interface Lead {
  id: string;
  client_id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  stage: LeadStage;
  value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;

  vehicle_type?: string | null;
  budget_range?: string | null;
  purchase_method?: string | null;
  down_payment_range?: string | null;
  employment_status?: string | null;
  has_trade_in?: string | null;
  purchase_timeline?: string | null;
  appointment_date?: string | null;
  appointment_time?: string | null;
  human_handoff_requested?: boolean;
  lead_score?: number;
  lead_temperature?: "HOT" | "WARM" | "NURTURE";
  preferred_contact?: string | null;
  ghl_event?: string | null;
  source_sent_at?: string | null;
}

export const stageLabels: Record<LeadStage, string> = {
  novo:       "Novo",
  contactado: "Contactado",
  proposta:   "Proposta",
  fechado:    "Fechado",
  perdido:    "Perdido",
};

export const demoLeads: Lead[] = [
  {
    id: "lead-1",
    client_id: "client-semper-fidelis",
    name: "John Smith",
    phone: "+1 (954) 555-0101",
    email: "john@email.com",
    source: "Google Ads",
    stage: "novo",
    value: 1200,
    notes: null,
    created_at: "2026-07-28T10:00:00.000Z",
    updated_at: "2026-07-28T10:00:00.000Z",
  },
  {
    id: "lead-2",
    client_id: "client-semper-fidelis",
    name: "Mary Johnson",
    phone: "+1 (954) 555-0102",
    email: "mary@email.com",
    source: "Meta Ads",
    stage: "contactado",
    value: 800,
    notes: "Interessada em limpeza mensal",
    created_at: "2026-07-27T09:00:00.000Z",
    updated_at: "2026-07-27T09:00:00.000Z",
  },
  {
    id: "lead-3",
    client_id: "client-semper-fidelis",
    name: "Robert Davis",
    phone: "+1 (954) 555-0103",
    email: "robert@email.com",
    source: "Indicação",
    stage: "proposta",
    value: 2400,
    notes: "Proposta enviada em 27/07",
    created_at: "2026-07-26T14:00:00.000Z",
    updated_at: "2026-07-27T16:00:00.000Z",
  },
  {
    id: "lead-4",
    client_id: "client-semper-fidelis",
    name: "Lisa Wilson",
    phone: "+1 (954) 555-0104",
    email: "lisa@email.com",
    source: "Google Ads",
    stage: "fechado",
    value: 1800,
    notes: "Fechou contrato mensal",
    created_at: "2026-07-20T11:00:00.000Z",
    updated_at: "2026-07-25T10:00:00.000Z",
  },
  {
    id: "lead-5",
    client_id: "client-autoforce",
    name: "Carlos Mendez",
    phone: "+1 (786) 555-0201",
    email: "carlos@email.com",
    source: "Meta Ads",
    stage: "novo",
    value: 35000,
    notes: null,
    created_at: "2026-07-28T08:00:00.000Z",
    updated_at: "2026-07-28T08:00:00.000Z",
  },
  {
    id: "lead-6",
    client_id: "client-autoforce",
    name: "Ana Torres",
    phone: "+1 (786) 555-0202",
    email: "ana@email.com",
    source: "Google Ads",
    stage: "proposta",
    value: 28000,
    notes: "Aguardando aprovação de financiamento",
    created_at: "2026-07-25T13:00:00.000Z",
    updated_at: "2026-07-27T09:00:00.000Z",
  },
];

export function getLeadsForClient(clientId: string): Lead[] {
  return demoLeads.filter((l) => l.client_id === clientId);
}
