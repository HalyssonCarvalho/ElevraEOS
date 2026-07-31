// Tipos que espelham o esquema do banco de dados (ver /supabase/schema.sql)
// Mantidos manualmente por enquanto; podem ser substituídos pelo gerador
// oficial do Supabase (`supabase gen types typescript`) quando o projeto
// real estiver conectado.

export type UserRole = "admin" | "consultor" | "cliente";

export type ClientStatus = "ativo" | "pausado" | "em_risco" | "encerrado";

export type ContentType =
  | "reels"
  | "stories"
  | "carrossel"
  | "post_estatico"
  | "email"
  | "sms"
  | "whatsapp"
  | "anuncio"
  | "evento"
  | "campanha_sazonal";

export type ContentStatus =
  | "ideia"
  | "planejado"
  | "em_producao"
  | "em_aprovacao"
  | "programado"
  | "publicado"
  | "cancelado";

export type CampaignStatus =
  | "planejada"
  | "ativa"
  | "pausada"
  | "concluida"
  | "cancelada";

export type TaskPriority = "baixa" | "media" | "alta" | "urgente";

export type TaskStatus =
  | "pendente"
  | "em_andamento"
  | "aguardando_cliente"
  | "concluida"
  | "cancelada";

export type KpiPeriod = "dia" | "semana" | "mes";

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Organization extends BaseRecord {
  name: string;
  slug: string;
}

export interface Profile extends BaseRecord {
  user_id: string;
  organization_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
}

export interface OrganizationMember extends BaseRecord {
  organization_id: string;
  profile_id: string;
  role: UserRole;
}

export interface Client extends BaseRecord {
  organization_id: string;
  company_name: string;
  owner_name: string;
  segment: string;
  email: string;
  phone: string;
  website: string | null;
  city: string;
  start_date: string;
  contract_value: number;
  responsible_profile_id: string | null;
  main_goal: string;
  monthly_leads_goal: number;
  monthly_revenue_goal: number;
  status: ClientStatus;
  logo_url: string | null;
}

export interface ClientMember extends BaseRecord {
  client_id: string;
  profile_id: string;
}

export interface KpiEntry extends BaseRecord {
  client_id: string;
  period_type: KpiPeriod;
  period_start: string;
  period_end: string;
  channel: string;
  investment: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  appointments: number;
  quotes: number;
  sales: number;
  revenue: number;
  average_ticket: number;
  reviews: number;
  notes: string | null;
  created_by: string | null;
}

export interface Campaign extends BaseRecord {
  client_id: string;
  name: string;
  big_idea: string;
  objective: string;
  target_audience: string;
  offer: string;
  start_date: string;
  end_date: string;
  channels: string[];
  budget: number;
  leads_goal: number;
  sales_goal: number;
  revenue_generated: number;
  status: CampaignStatus;
  final_result: string | null;
  learnings: string | null;
}

export interface ContentCalendarItem extends BaseRecord {
  client_id: string;
  campaign_id: string | null;
  date: string;
  campaign_name: string;
  content_type: ContentType;
  channel: string;
  objective: string;
  responsible_profile_id: string | null;
  status: ContentStatus;
  cta: string;
  notes: string | null;
}

export interface Task extends BaseRecord {
  client_id: string;
  title: string;
  description: string | null;
  responsible_profile_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  category: string;
}

export interface WeeklyReport extends BaseRecord {
  client_id: string;
  week_label: string;
  key_numbers: string;
  what_improved: string;
  what_worsened: string;
  best_campaign: string;
  main_bottleneck: string;
  decisions_made: string;
  next_week_priorities: string;
  responsible_profile_id: string | null;
  deadline: string;
  notes: string | null;
}

export type ScorePillar =
  | "marketing"
  | "comercial"
  | "estrutura"
  | "operacao"
  | "atendimento";

export interface ElevraScore extends BaseRecord {
  client_id: string;
  period: string;
  marketing_score: number;
  marketing_notes: string;
  comercial_score: number;
  comercial_notes: string;
  estrutura_score: number;
  estrutura_notes: string;
  operacao_score: number;
  operacao_notes: string;
  atendimento_score: number;
  atendimento_notes: string;
  overall_score: number;
  recommended_action_plan: string;
  created_by: string | null;
}

export interface ActivityLog extends BaseRecord {
  organization_id: string;
  client_id: string | null;
  profile_id: string | null;
  action: string;
  details: string | null;
}

// Métricas calculadas a partir de KpiEntry — nunca persistidas diretamente.
export interface CalculatedMetrics {
  cpl: number | null;
  leadToSaleRate: number | null;
  roi: number | null;
  roas: number | null;
  averageTicket: number | null;
  growthVsPrevious: number | null;
}

export type CredentialCategory =
  | "social_media"
  | "ads"
  | "website"
  | "crm"
  | "email_marketing"
  | "analytics"
  | "hosting"
  | "domain"
  | "other";

export interface ClientCredential extends BaseRecord {
  client_id: string;
  organization_id: string;
  label: string;
  category: CredentialCategory;
  username: string;
  password_plain?: string;
  password_enc: string;
  url: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
}
