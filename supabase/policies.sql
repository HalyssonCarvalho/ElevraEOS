-- =============================================================================
-- ELEVRA OS — ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Rode depois de schema.sql.
--
-- Regras aplicadas (ver briefing original):
--   - Administradores acessam todos os clientes da própria organização.
--   - Consultores acessam apenas os clientes atribuídos (client_members).
--   - Clientes acessam apenas os dados da própria empresa (client_members
--     ligando o perfil com role='cliente' ao client_id correspondente).
--   - Nenhum usuário acessa dados de outra organização.
--   - A service role key nunca é usada no navegador — client_id de convites
--     e criação de usuários deve passar por uma Server Action/Route Handler.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Funções auxiliares (SECURITY DEFINER: leem `profiles` ignorando a própria
-- RLS da tabela, evitando recursão infinita nas policies abaixo).
-- -----------------------------------------------------------------------------

create or replace function public.my_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.profiles where user_id = auth.uid();
$$;

create or replace function public.my_organization_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id from public.profiles where user_id = auth.uid();
$$;

create or replace function public.my_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'admin' from public.profiles where user_id = auth.uid()), false);
$$;

-- Verdadeiro se o usuário autenticado pode acessar o cliente informado:
-- admin da mesma organização, OU consultor/cliente com vínculo em client_members.
create or replace function public.has_client_access(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.clients c
    where c.id = target_client_id
      and c.organization_id = public.my_organization_id()
      and (
        public.is_admin()
        or exists (
          select 1 from public.client_members cm
          where cm.client_id = c.id
            and cm.profile_id = public.my_profile_id()
        )
      )
  );
$$;

-- -----------------------------------------------------------------------------
-- Habilita RLS em todas as tabelas
-- -----------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_members enable row level security;
alter table public.kpi_entries enable row level security;
alter table public.campaigns enable row level security;
alter table public.content_calendar enable row level security;
alter table public.tasks enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.elevra_scores enable row level security;
alter table public.activity_logs enable row level security;

-- -----------------------------------------------------------------------------
-- organizations
-- -----------------------------------------------------------------------------

create policy "Ver a própria organização"
  on public.organizations for select
  using (id = public.my_organization_id());

create policy "Admin atualiza a própria organização"
  on public.organizations for update
  using (id = public.my_organization_id() and public.is_admin());

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

create policy "Ver perfis da própria organização"
  on public.profiles for select
  using (organization_id = public.my_organization_id());

create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (user_id = auth.uid());

create policy "Admin atualiza perfis da organização"
  on public.profiles for update
  using (organization_id = public.my_organization_id() and public.is_admin());

-- Inserção de novos perfis (convites) deve ocorrer via Server Action usando
-- a service role key — por isso não há policy de INSERT aberta para o
-- cliente aqui. Veja README.md, seção "Convidar usuários".

-- -----------------------------------------------------------------------------
-- organization_members
-- -----------------------------------------------------------------------------

create policy "Ver membros da própria organização"
  on public.organization_members for select
  using (organization_id = public.my_organization_id());

create policy "Admin gerencia membros da organização"
  on public.organization_members for all
  using (organization_id = public.my_organization_id() and public.is_admin())
  with check (organization_id = public.my_organization_id() and public.is_admin());

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------

create policy "Admin vê todos os clientes da organização"
  on public.clients for select
  using (organization_id = public.my_organization_id() and public.is_admin());

create policy "Consultor e cliente veem clientes atribuídos"
  on public.clients for select
  using (
    organization_id = public.my_organization_id()
    and exists (
      select 1 from public.client_members cm
      where cm.client_id = clients.id
        and cm.profile_id = public.my_profile_id()
    )
  );

create policy "Admin cria clientes"
  on public.clients for insert
  with check (organization_id = public.my_organization_id() and public.is_admin());

create policy "Admin edita clientes"
  on public.clients for update
  using (organization_id = public.my_organization_id() and public.is_admin());

create policy "Admin exclui clientes"
  on public.clients for delete
  using (organization_id = public.my_organization_id() and public.is_admin());

-- -----------------------------------------------------------------------------
-- client_members (atribuições) — gerenciadas apenas por administradores
-- -----------------------------------------------------------------------------

create policy "Ver os próprios vínculos ou, se admin, todos da organização"
  on public.client_members for select
  using (
    profile_id = public.my_profile_id()
    or exists (
      select 1 from public.clients c
      where c.id = client_members.client_id
        and c.organization_id = public.my_organization_id()
        and public.is_admin()
    )
  );

create policy "Admin gerencia atribuições de clientes"
  on public.client_members for all
  using (
    exists (
      select 1 from public.clients c
      where c.id = client_members.client_id
        and c.organization_id = public.my_organization_id()
        and public.is_admin()
    )
  )
  with check (
    exists (
      select 1 from public.clients c
      where c.id = client_members.client_id
        and c.organization_id = public.my_organization_id()
        and public.is_admin()
    )
  );

-- -----------------------------------------------------------------------------
-- Macro para as tabelas de dados de um cliente (kpi_entries, campaigns,
-- content_calendar, tasks, weekly_reports, elevra_scores):
--   - SELECT: qualquer papel com acesso ao cliente (has_client_access)
--   - INSERT/UPDATE: admin ou consultor com acesso ao cliente (clientes têm
--     apenas leitura, conforme o briefing)
--   - DELETE: admin, ou consultor com acesso ao cliente
-- -----------------------------------------------------------------------------

-- kpi_entries
create policy "Ver KPIs de clientes com acesso"
  on public.kpi_entries for select
  using (public.has_client_access(client_id));

create policy "Admin/consultor registra KPIs"
  on public.kpi_entries for insert
  with check (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor edita KPIs"
  on public.kpi_entries for update
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor exclui KPIs"
  on public.kpi_entries for delete
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

-- campaigns
create policy "Ver campanhas de clientes com acesso"
  on public.campaigns for select
  using (public.has_client_access(client_id));

create policy "Admin/consultor cria campanhas"
  on public.campaigns for insert
  with check (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor edita campanhas"
  on public.campaigns for update
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor exclui campanhas"
  on public.campaigns for delete
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

-- content_calendar
create policy "Ver calendário de clientes com acesso"
  on public.content_calendar for select
  using (public.has_client_access(client_id));

create policy "Admin/consultor cria itens de calendário"
  on public.content_calendar for insert
  with check (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor edita itens de calendário"
  on public.content_calendar for update
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor exclui itens de calendário"
  on public.content_calendar for delete
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

-- tasks
create policy "Ver tarefas de clientes com acesso"
  on public.tasks for select
  using (public.has_client_access(client_id));

create policy "Admin/consultor cria tarefas"
  on public.tasks for insert
  with check (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor edita tarefas"
  on public.tasks for update
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Cliente atualiza status das próprias tarefas"
  on public.tasks for update
  using (public.has_client_access(client_id) and public.my_role() = 'cliente');

create policy "Admin/consultor exclui tarefas"
  on public.tasks for delete
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

-- weekly_reports
create policy "Ver relatórios de clientes com acesso"
  on public.weekly_reports for select
  using (public.has_client_access(client_id));

create policy "Admin/consultor cria relatórios"
  on public.weekly_reports for insert
  with check (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor edita relatórios"
  on public.weekly_reports for update
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor exclui relatórios"
  on public.weekly_reports for delete
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

-- elevra_scores
create policy "Ver scores de clientes com acesso"
  on public.elevra_scores for select
  using (public.has_client_access(client_id));

create policy "Admin/consultor registra scores"
  on public.elevra_scores for insert
  with check (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

create policy "Admin/consultor edita scores"
  on public.elevra_scores for update
  using (public.has_client_access(client_id) and public.my_role() in ('admin', 'consultor'));

-- -----------------------------------------------------------------------------
-- activity_logs — leitura para quem tem acesso ao cliente/organização;
-- escrita feita pelo backend (Server Actions), não diretamente pelo cliente.
-- -----------------------------------------------------------------------------

create policy "Ver logs da própria organização"
  on public.activity_logs for select
  using (organization_id = public.my_organization_id() and public.is_admin());

create policy "Sistema registra logs"
  on public.activity_logs for insert
  with check (organization_id = public.my_organization_id());
