-- =============================================================================
-- ELEVRA OS — SCHEMA DO BANCO DE DADOS (Supabase / Postgres)
-- =============================================================================
-- Como aplicar:
--   1. Crie um projeto em https://supabase.com
--   2. Abra o SQL Editor do projeto
--   3. Rode este arquivo primeiro, depois policies.sql, depois (opcional) seed.sql
--
-- Este schema espelha os tipos em src/lib/types/database.ts. Se um for
-- alterado, o outro deve ser atualizado junto.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

create type user_role as enum ('admin', 'consultor', 'cliente');

create type client_status as enum ('ativo', 'pausado', 'em_risco', 'encerrado');

create type kpi_period as enum ('dia', 'semana', 'mes');

create type content_type as enum (
  'reels', 'stories', 'carrossel', 'post_estatico', 'email',
  'sms', 'whatsapp', 'anuncio', 'evento', 'campanha_sazonal'
);

create type content_status as enum (
  'ideia', 'planejado', 'em_producao', 'em_aprovacao',
  'programado', 'publicado', 'cancelado'
);

create type campaign_status as enum (
  'planejada', 'ativa', 'pausada', 'concluida', 'cancelada'
);

create type task_priority as enum ('baixa', 'media', 'alta', 'urgente');

create type task_status as enum (
  'pendente', 'em_andamento', 'aguardando_cliente', 'concluida', 'cancelada'
);

-- -----------------------------------------------------------------------------
-- FUNÇÃO UTILITÁRIA: updated_at automático
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- organizations
-- -----------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- profiles
-- Um perfil por usuário autenticado (auth.users). Guarda papel e organização.
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'consultor',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_organization on public.profiles (organization_id);
create index idx_profiles_user on public.profiles (user_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- organization_members
-- Vínculo explícito entre organização e perfil (permite, no futuro, um
-- mesmo usuário pertencer a mais de uma organização).
-- -----------------------------------------------------------------------------

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role user_role not null default 'consultor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create trigger trg_organization_members_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  company_name text not null,
  owner_name text not null,
  segment text not null,
  email text not null,
  phone text not null,
  website text,
  city text not null,
  start_date date not null,
  contract_value numeric(12, 2) not null default 0,
  responsible_profile_id uuid references public.profiles (id) on delete set null,
  main_goal text not null default '',
  monthly_leads_goal integer not null default 0,
  monthly_revenue_goal numeric(12, 2) not null default 0,
  status client_status not null default 'ativo',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clients_organization on public.clients (organization_id);
create index idx_clients_responsible on public.clients (responsible_profile_id);
create index idx_clients_status on public.clients (status);

create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- client_members
-- Define quem tem acesso a um cliente: consultores atribuídos e o(s)
-- usuário(s) do próprio cliente (perfis com role = 'cliente').
-- -----------------------------------------------------------------------------

create table public.client_members (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, profile_id)
);

create index idx_client_members_client on public.client_members (client_id);
create index idx_client_members_profile on public.client_members (profile_id);

create trigger trg_client_members_updated_at
  before update on public.client_members
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- kpi_entries
-- -----------------------------------------------------------------------------

create table public.kpi_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  period_type kpi_period not null default 'semana',
  period_start date not null,
  period_end date not null,
  channel text not null,
  investment numeric(12, 2) not null default 0,
  impressions integer not null default 0,
  reach integer not null default 0,
  clicks integer not null default 0,
  leads integer not null default 0,
  appointments integer not null default 0,
  quotes integer not null default 0,
  sales integer not null default 0,
  revenue numeric(12, 2) not null default 0,
  average_ticket numeric(12, 2) not null default 0,
  reviews integer not null default 0,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_kpi_period check (period_end >= period_start)
);

create index idx_kpi_entries_client on public.kpi_entries (client_id);
create index idx_kpi_entries_period on public.kpi_entries (client_id, period_end desc);

create trigger trg_kpi_entries_updated_at
  before update on public.kpi_entries
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- campaigns
-- -----------------------------------------------------------------------------

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  big_idea text not null default '',
  objective text not null default '',
  target_audience text not null default '',
  offer text not null default '',
  start_date date not null,
  end_date date not null,
  channels text[] not null default '{}',
  budget numeric(12, 2) not null default 0,
  leads_goal integer not null default 0,
  sales_goal integer not null default 0,
  revenue_generated numeric(12, 2) not null default 0,
  status campaign_status not null default 'planejada',
  final_result text,
  learnings text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_campaign_dates check (end_date >= start_date)
);

create index idx_campaigns_client on public.campaigns (client_id);
create index idx_campaigns_status on public.campaigns (status);

create trigger trg_campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- content_calendar
-- -----------------------------------------------------------------------------

create table public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  date date not null,
  campaign_name text not null default '',
  content_type content_type not null,
  channel text not null,
  objective text not null default '',
  responsible_profile_id uuid references public.profiles (id) on delete set null,
  status content_status not null default 'ideia',
  cta text not null default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_content_calendar_client on public.content_calendar (client_id);
create index idx_content_calendar_date on public.content_calendar (date);
create index idx_content_calendar_campaign on public.content_calendar (campaign_id);

create trigger trg_content_calendar_updated_at
  before update on public.content_calendar
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- tasks
-- -----------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  description text,
  responsible_profile_id uuid references public.profiles (id) on delete set null,
  priority task_priority not null default 'media',
  status task_status not null default 'pendente',
  due_date date not null,
  category text not null default 'Geral',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_client on public.tasks (client_id);
create index idx_tasks_status on public.tasks (status);
create index idx_tasks_due_date on public.tasks (due_date);

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- weekly_reports
-- -----------------------------------------------------------------------------

create table public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  week_label text not null,
  key_numbers text not null default '',
  what_improved text not null default '',
  what_worsened text not null default '',
  best_campaign text not null default '',
  main_bottleneck text not null default '',
  decisions_made text not null default '',
  next_week_priorities text not null default '',
  responsible_profile_id uuid references public.profiles (id) on delete set null,
  deadline date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_weekly_reports_client on public.weekly_reports (client_id);

create trigger trg_weekly_reports_updated_at
  before update on public.weekly_reports
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- elevra_scores
-- -----------------------------------------------------------------------------

create table public.elevra_scores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  period text not null,
  marketing_score numeric(5, 2) not null check (marketing_score between 0 and 100),
  marketing_notes text not null default '',
  comercial_score numeric(5, 2) not null check (comercial_score between 0 and 100),
  comercial_notes text not null default '',
  estrutura_score numeric(5, 2) not null check (estrutura_score between 0 and 100),
  estrutura_notes text not null default '',
  operacao_score numeric(5, 2) not null check (operacao_score between 0 and 100),
  operacao_notes text not null default '',
  atendimento_score numeric(5, 2) not null check (atendimento_score between 0 and 100),
  atendimento_notes text not null default '',
  overall_score numeric(5, 2) not null check (overall_score between 0 and 100),
  recommended_action_plan text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_elevra_scores_client on public.elevra_scores (client_id, created_at desc);

create trigger trg_elevra_scores_updated_at
  before update on public.elevra_scores
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- activity_logs
-- Trilha de auditoria simples — quem fez o quê, quando.
-- -----------------------------------------------------------------------------

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_activity_logs_organization on public.activity_logs (organization_id, created_at desc);
create index idx_activity_logs_client on public.activity_logs (client_id, created_at desc);

create trigger trg_activity_logs_updated_at
  before update on public.activity_logs
  for each row execute function public.set_updated_at();
