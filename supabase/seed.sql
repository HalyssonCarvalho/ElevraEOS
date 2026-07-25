-- =============================================================================
-- ELEVRA OS — DADOS DE DEMONSTRAÇÃO (seed)
-- =============================================================================
-- Rode depois de schema.sql e policies.sql.
--
-- PASSO 1 — crie os usuários de autenticação primeiro (Supabase Dashboard >
-- Authentication > Users > Invite user, ou supabase.auth.admin.createUser
-- em um script server-side). Use exatamente estes e-mails:
--   marina@elevra.digital    (será admin)
--   rafael@elevra.digital    (será consultor)
--   bianca@elevra.digital    (será consultor)
--
-- PASSO 2 — depois de criados, rode este arquivo. Os INSERTs de `profiles`
-- abaixo buscam o id de cada usuário em auth.users pelo e-mail, então a
-- ordem importa: usuários de auth primeiro, depois este seed.
--
-- Todas as métricas abaixo são fictícias e servem apenas para demonstrar a
-- interface — não representam dados reais de clientes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Organização
-- -----------------------------------------------------------------------------

insert into public.organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Elevra Digital', 'elevra-digital')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Perfis (requer que os usuários já existam em auth.users — ver PASSO 1)
-- -----------------------------------------------------------------------------

insert into public.profiles (organization_id, user_id, full_name, email, role)
select '00000000-0000-0000-0000-000000000001', u.id, 'Marina Duarte', 'marina@elevra.digital', 'admin'
from auth.users u
where u.email = 'marina@elevra.digital'
on conflict (user_id) do nothing;

insert into public.profiles (organization_id, user_id, full_name, email, role)
select '00000000-0000-0000-0000-000000000001', u.id, 'Rafael Nogueira', 'rafael@elevra.digital', 'consultor'
from auth.users u
where u.email = 'rafael@elevra.digital'
on conflict (user_id) do nothing;

insert into public.profiles (organization_id, user_id, full_name, email, role)
select '00000000-0000-0000-0000-000000000001', u.id, 'Bianca Ferraz', 'bianca@elevra.digital', 'consultor'
from auth.users u
where u.email = 'bianca@elevra.digital'
on conflict (user_id) do nothing;

-- -----------------------------------------------------------------------------
-- Clientes
-- -----------------------------------------------------------------------------

insert into public.clients (
  id, organization_id, company_name, owner_name, segment, email, phone, website,
  city, start_date, contract_value, responsible_profile_id, main_goal,
  monthly_leads_goal, monthly_revenue_goal, status
)
values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Semper Fidelis Floor Care', 'Michael Costa', 'Serviços residenciais (limpeza de pisos)',
  'contato@semperfidelisfloorcare.com', '+1 (954) 555-0142', 'https://semperfidelisfloorcare.com',
  'Deerfield Beach, FL', '2025-11-03', 2200,
  (select id from public.profiles where email = 'rafael@elevra.digital'),
  'Aumentar agendamentos recorrentes de limpeza comercial e residencial',
  120, 45000, 'ativo'
)
on conflict (id) do nothing;

insert into public.clients (
  id, organization_id, company_name, owner_name, segment, email, phone, website,
  city, start_date, contract_value, responsible_profile_id, main_goal,
  monthly_leads_goal, monthly_revenue_goal, status
)
values (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'AutoForce Group', 'Daniel Reyes', 'Concessionária / venda de veículos seminovos',
  'marketing@autoforcegroup.com', '+1 (786) 555-0198', 'https://autoforcegroup.com',
  'Miami, FL', '2025-06-15', 4800,
  (select id from public.profiles where email = 'bianca@elevra.digital'),
  'Gerar leads qualificados para o time de vendas e reduzir CPL',
  260, 180000, 'ativo'
)
on conflict (id) do nothing;

insert into public.clients (
  id, organization_id, company_name, owner_name, segment, email, phone, website,
  city, start_date, contract_value, responsible_profile_id, main_goal,
  monthly_leads_goal, monthly_revenue_goal, status
)
values (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Rose Lopes Realty', 'Rose Lopes', 'Imobiliário residencial',
  'rose@roselopesrealty.com', '+1 (561) 555-0177', 'https://roselopesrealty.com',
  'Boca Raton, FL', '2026-01-10', 3200,
  (select id from public.profiles where email = 'rafael@elevra.digital'),
  'Fortalecer autoridade da marca pessoal e gerar leads de compradores',
  80, 60000, 'em_risco'
)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- client_members — vincula os consultores responsáveis a cada cliente
-- (usuários do próprio cliente devem ser adicionados depois de convidados,
-- da mesma forma: crie o auth user e faça o INSERT correspondente).
-- -----------------------------------------------------------------------------

insert into public.client_members (client_id, profile_id)
select '10000000-0000-0000-0000-000000000001', id from public.profiles where email = 'rafael@elevra.digital'
union all
select '10000000-0000-0000-0000-000000000002', id from public.profiles where email = 'bianca@elevra.digital'
union all
select '10000000-0000-0000-0000-000000000003', id from public.profiles where email = 'rafael@elevra.digital'
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- kpi_entries (3 semanas por cliente, 2 canais para os dois primeiros)
-- -----------------------------------------------------------------------------

insert into public.kpi_entries (
  client_id, period_type, period_start, period_end, channel, investment,
  impressions, reach, clicks, leads, appointments, quotes, sales, revenue,
  average_ticket, reviews
)
values
  ('10000000-0000-0000-0000-000000000001', 'semana', '2026-06-29', '2026-07-05', 'Meta Ads', 650, 42000, 21000, 980, 24, 20, 15, 9, 4100, 456, 2),
  ('10000000-0000-0000-0000-000000000001', 'semana', '2026-07-06', '2026-07-12', 'Meta Ads', 700, 45500, 22800, 1050, 27, 23, 18, 11, 5200, 473, 3),
  ('10000000-0000-0000-0000-000000000001', 'semana', '2026-07-13', '2026-07-19', 'Meta Ads', 720, 48200, 24100, 1120, 31, 27, 20, 13, 6300, 485, 1),
  ('10000000-0000-0000-0000-000000000001', 'semana', '2026-06-29', '2026-07-05', 'Google Ads', 300, 12000, 9000, 410, 10, 9, 7, 5, 2400, 480, 0),
  ('10000000-0000-0000-0000-000000000001', 'semana', '2026-07-06', '2026-07-12', 'Google Ads', 320, 12800, 9400, 445, 12, 11, 8, 6, 2850, 475, 1),
  ('10000000-0000-0000-0000-000000000001', 'semana', '2026-07-13', '2026-07-19', 'Google Ads', 310, 12300, 9100, 430, 11, 10, 8, 6, 2700, 450, 0),

  ('10000000-0000-0000-0000-000000000002', 'semana', '2026-06-29', '2026-07-05', 'Meta Ads', 2400, 210000, 98000, 3400, 58, 40, 30, 12, 21600, 1800, 1),
  ('10000000-0000-0000-0000-000000000002', 'semana', '2026-07-06', '2026-07-12', 'Meta Ads', 2600, 224000, 101500, 3650, 63, 45, 33, 14, 25800, 1843, 2),
  ('10000000-0000-0000-0000-000000000002', 'semana', '2026-07-13', '2026-07-19', 'Meta Ads', 2550, 219000, 99800, 3580, 61, 44, 32, 15, 27300, 1820, 3),
  ('10000000-0000-0000-0000-000000000002', 'semana', '2026-06-29', '2026-07-05', 'Google Ads', 1800, 68000, 41000, 2100, 34, 22, 18, 8, 14200, 1775, 0),
  ('10000000-0000-0000-0000-000000000002', 'semana', '2026-07-06', '2026-07-12', 'Google Ads', 1850, 70500, 42200, 2180, 37, 25, 19, 9, 16400, 1822, 1),
  ('10000000-0000-0000-0000-000000000002', 'semana', '2026-07-13', '2026-07-19', 'Google Ads', 1900, 71800, 43000, 2230, 36, 26, 20, 10, 17900, 1790, 1),

  ('10000000-0000-0000-0000-000000000003', 'semana', '2026-06-29', '2026-07-05', 'Instagram Orgânico + Meta Ads', 400, 31000, 18000, 520, 9, 5, 3, 1, 8500, 8500, 0),
  ('10000000-0000-0000-0000-000000000003', 'semana', '2026-07-06', '2026-07-12', 'Instagram Orgânico + Meta Ads', 380, 27500, 16200, 470, 7, 4, 2, 0, 0, 0, 0),
  ('10000000-0000-0000-0000-000000000003', 'semana', '2026-07-13', '2026-07-19', 'Instagram Orgânico + Meta Ads', 350, 24800, 14500, 410, 6, 3, 2, 1, 7200, 7200, 0);

-- -----------------------------------------------------------------------------
-- campaigns
-- -----------------------------------------------------------------------------

insert into public.campaigns (
  client_id, name, big_idea, objective, target_audience, offer, start_date,
  end_date, channels, budget, leads_goal, sales_goal, revenue_generated, status, learnings
)
values
  (
    '10000000-0000-0000-0000-000000000001', 'Piso Novo Para o Verão',
    'Sua casa merece o mesmo cuidado que você dá ao seu carro',
    'Gerar agendamentos de limpeza profunda residencial',
    'Proprietários de casas em Deerfield Beach e Boca Raton, 35-65 anos',
    '20% de desconto na primeira limpeza para novos clientes',
    '2026-06-01', '2026-08-31', array['Meta Ads', 'Google Ads', 'WhatsApp'],
    6000, 300, 110, 41300, 'ativa', null
  ),
  (
    '10000000-0000-0000-0000-000000000002', 'Feirão de Seminovos Julho',
    'O carro certo, no preço certo, hoje',
    'Aumentar visitas à loja e test-drives agendados',
    'Compradores de veículos usados na Grande Miami, 25-55 anos',
    'Entrada facilitada + avaliação do seu carro na troca',
    '2026-07-01', '2026-07-31', array['Meta Ads', 'Google Ads', 'E-mail'],
    9500, 260, 45, 87700, 'ativa', null
  ),
  (
    '10000000-0000-0000-0000-000000000003', 'Marca Pessoal Rose Lopes',
    'Quem conhece o bairro, encontra a casa certa',
    'Construir autoridade e gerar leads de compradores qualificados',
    'Famílias buscando primeira casa em Boca Raton',
    'Consultoria gratuita de avaliação de imóvel',
    '2026-05-01', '2026-07-31', array['Instagram', 'Meta Ads'],
    3200, 90, 4, 15700, 'pausada',
    'Engajamento alto, mas conversão em leads qualificados abaixo da meta — revisar segmentação.'
  );

-- -----------------------------------------------------------------------------
-- content_calendar
-- -----------------------------------------------------------------------------

insert into public.content_calendar (
  client_id, date, campaign_name, content_type, channel, objective,
  responsible_profile_id, status, cta
)
values
  ('10000000-0000-0000-0000-000000000001', '2026-07-25', 'Piso Novo Para o Verão', 'reels', 'Instagram', 'Engajamento',
    (select id from public.profiles where email = 'rafael@elevra.digital'), 'programado', 'Agende sua limpeza'),
  ('10000000-0000-0000-0000-000000000002', '2026-07-26', 'Feirão de Seminovos Julho', 'anuncio', 'Meta Ads', 'Conversão',
    (select id from public.profiles where email = 'bianca@elevra.digital'), 'publicado', 'Agende seu test-drive'),
  ('10000000-0000-0000-0000-000000000003', '2026-07-28', 'Marca Pessoal Rose Lopes', 'carrossel', 'Instagram', 'Autoridade',
    (select id from public.profiles where email = 'rafael@elevra.digital'), 'em_producao', 'Fale com a Rose'),
  ('10000000-0000-0000-0000-000000000001', '2026-07-29', 'Piso Novo Para o Verão', 'whatsapp', 'WhatsApp', 'Retenção',
    (select id from public.profiles where email = 'rafael@elevra.digital'), 'planejado', 'Renove seu plano trimestral'),
  ('10000000-0000-0000-0000-000000000002', '2026-07-31', 'Feirão de Seminovos Julho', 'email', 'E-mail', 'Conversão',
    (select id from public.profiles where email = 'bianca@elevra.digital'), 'em_aprovacao', 'Últimos dias do feirão');

-- -----------------------------------------------------------------------------
-- tasks
-- -----------------------------------------------------------------------------

insert into public.tasks (client_id, title, description, responsible_profile_id, priority, status, due_date, category)
values
  ('10000000-0000-0000-0000-000000000001', 'Gravar reels de antes/depois de limpeza comercial',
    'Captar material em cliente comercial autorizado para uso de imagem.',
    (select id from public.profiles where email = 'rafael@elevra.digital'), 'alta', 'em_andamento', '2026-07-26', 'Conteúdo'),
  ('10000000-0000-0000-0000-000000000002', 'Revisar públicos personalizados da campanha de feirão', null,
    (select id from public.profiles where email = 'bianca@elevra.digital'), 'urgente', 'pendente', '2026-07-25', 'Tráfego pago'),
  ('10000000-0000-0000-0000-000000000003', 'Aprovar carrossel do imóvel na Palmetto Park Rd.',
    'Aguardando aprovação da cliente antes de programar publicação.',
    (select id from public.profiles where email = 'rafael@elevra.digital'), 'media', 'aguardando_cliente', '2026-07-27', 'Conteúdo'),
  ('10000000-0000-0000-0000-000000000002', 'Enviar relatório executivo do feirão para o cliente', null,
    (select id from public.profiles where email = 'bianca@elevra.digital'), 'alta', 'pendente', '2026-07-24', 'Relatório'),
  ('10000000-0000-0000-0000-000000000001', 'Configurar automação de WhatsApp para renovação trimestral', null,
    (select id from public.profiles where email = 'rafael@elevra.digital'), 'baixa', 'concluida', '2026-07-18', 'Automação'),
  ('10000000-0000-0000-0000-000000000003', 'Reunião de revisão de estratégia com a cliente',
    'Cliente sinalizou insatisfação com volume de leads — priorizar.',
    (select id from public.profiles where email = 'rafael@elevra.digital'), 'urgente', 'pendente', '2026-07-24', 'Estratégia');

-- -----------------------------------------------------------------------------
-- weekly_reports
-- -----------------------------------------------------------------------------

insert into public.weekly_reports (
  client_id, week_label, key_numbers, what_improved, what_worsened, best_campaign,
  main_bottleneck, decisions_made, next_week_priorities, responsible_profile_id, deadline
)
values
  (
    '10000000-0000-0000-0000-000000000002', '13 a 19 de julho de 2026',
    '97 leads, 25 vendas, US$ 45.200 em receita, ROAS 6,4x',
    'Custo por lead caiu 8% após otimização de públicos no Meta Ads.',
    'Tempo médio de resposta subiu para 42 minutos, acima da meta de 15.',
    'Feirão de Seminovos Julho',
    'Time comercial sem capacidade de resposta rápida nos horários de pico.',
    'Contratar SDR temporário para o período do feirão.',
    'Reduzir tempo de resposta, escalar orçamento da campanha vencedora.',
    (select id from public.profiles where email = 'bianca@elevra.digital'), '2026-07-22'
  ),
  (
    '10000000-0000-0000-0000-000000000001', '13 a 19 de julho de 2026',
    '42 leads, 19 vendas, US$ 9.000 em receita',
    'Avaliações no Google cresceram de 4,7 para 4,8.',
    'Nenhum ponto crítico identificado nesta semana.',
    'Piso Novo Para o Verão',
    'Agenda de equipes de campo próxima do limite na alta temporada.',
    'Avaliar contratação de uma equipe extra para agosto.',
    'Testar novo criativo de depoimento em vídeo.',
    (select id from public.profiles where email = 'rafael@elevra.digital'), '2026-07-22'
  );

-- -----------------------------------------------------------------------------
-- elevra_scores
-- -----------------------------------------------------------------------------

insert into public.elevra_scores (
  client_id, period, marketing_score, marketing_notes, comercial_score, comercial_notes,
  estrutura_score, estrutura_notes, operacao_score, operacao_notes,
  atendimento_score, atendimento_notes, overall_score, recommended_action_plan, created_by
)
values
  (
    '10000000-0000-0000-0000-000000000001', 'Julho 2026',
    82, 'Boa consistência de conteúdo e resultados de tráfego pago acima da meta.',
    75, 'Conversão de orçamento para venda estável, com espaço para follow-up mais ágil.',
    68, 'Capacidade operacional próxima do limite na alta temporada.',
    79, 'Processos de agendamento funcionando bem, poucas reclamações.',
    88, 'Avaliações consistentemente altas (4,8/5).',
    78.4, 'Avaliar contratação de equipe extra para sustentar crescimento sem perder qualidade no atendimento.',
    (select id from public.profiles where email = 'rafael@elevra.digital')
  ),
  (
    '10000000-0000-0000-0000-000000000002', 'Julho 2026',
    90, 'Campanha de feirão superando metas de leads e receita.',
    71, 'Tempo de resposta acima da meta está custando conversões.',
    80, 'Estoque de seminovos bem posicionado para a campanha atual.',
    74, 'Processo de repasse de leads para vendedores pode ser mais rápido.',
    77, 'Satisfação pós-venda estável, sem grandes variações.',
    78.4, 'Priorizar redução do tempo de resposta comercial via SDR dedicado durante campanhas.',
    (select id from public.profiles where email = 'bianca@elevra.digital')
  ),
  (
    '10000000-0000-0000-0000-000000000003', 'Julho 2026',
    58, 'Engajamento bom, mas geração de leads qualificados abaixo da meta.',
    45, 'Poucas vendas fechadas no período — maior ponto de atenção.',
    70, 'Operação enxuta, mas funcional para o volume atual.',
    63, 'Aprovações de conteúdo estão atrasando publicações.',
    80, 'Cliente muito acessível e comunicativa.',
    63.2, 'Revisar segmentação de público e oferta da campanha; acelerar fluxo de aprovação de conteúdo.',
    (select id from public.profiles where email = 'rafael@elevra.digital')
  );
