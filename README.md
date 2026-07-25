# Elevra OS

Sistema interno da **Elevra Digital** para acompanhar marketing, vendas, resultados e
planos de ação dos clientes da agência.

Construído com Next.js (App Router) + TypeScript + Tailwind CSS + Supabase, com uma
interface premium, executiva e minimalista inspirada em Linear, Stripe e Notion.

> **Estado atual:** primeira versão funcional. Todas as telas funcionam com dados de
> demonstração (3 clientes fictícios) mesmo sem um projeto Supabase conectado. Ao
> configurar as variáveis de ambiente do Supabase e aplicar o schema em `/supabase`,
> a aplicação passa a ler e gravar dados reais — nenhuma tela precisa ser reescrita.

---

## 1. Arquitetura de pastas

```
elevra-os/
├── src/
│   ├── app/
│   │   ├── login/page.tsx                 # Login (Supabase Auth + modo demo)
│   │   ├── page.tsx                       # Redireciona para /login
│   │   └── (app)/                         # Grupo de rotas autenticadas
│   │       ├── layout.tsx                 # Sidebar + Topbar + DemoRoleProvider
│   │       ├── dashboard/page.tsx         # Dashboard geral
│   │       ├── clients/
│   │       │   ├── page.tsx               # Lista de clientes
│   │       │   ├── new/page.tsx           # Cadastro de cliente
│   │       │   └── [id]/
│   │       │       ├── layout.tsx         # Cabeçalho do cliente + abas
│   │       │       ├── page.tsx           # Visão geral
│   │       │       ├── kpis/page.tsx
│   │       │       ├── marketing/page.tsx # Campanhas
│   │       │       ├── calendar/page.tsx
│   │       │       ├── tasks/page.tsx
│   │       │       ├── reports/page.tsx   # Relatórios semanais
│   │       │       ├── score/page.tsx     # Score Elevra
│   │       │       └── settings/page.tsx
│   │       ├── tasks/page.tsx             # Tarefas — visão global
│   │       ├── calendar/page.tsx          # Calendário — visão global
│   │       └── reports/page.tsx           # Relatórios — visão global
│   │
│   ├── components/
│   │   ├── ui/          # Button, Card, Badge, Input/Select/Textarea, Tabs,
│   │   │                 # StatCard, PageHeader, EmptyState, Skeleton
│   │   ├── layout/       # Sidebar, Topbar, MobileNav, nav-items
│   │   ├── auth/         # LoginForm
│   │   ├── clients/      # ClientsView, ClientForm, ClientSettingsForm, MetricCard
│   │   ├── kpis/         # KpiForm, KpiPageClient
│   │   ├── campaigns/    # CampaignForm, CampaignsPageClient
│   │   ├── calendar/     # CalendarItemForm, CalendarPageClient
│   │   ├── tasks/        # TaskForm, TasksPageClient
│   │   ├── reports/      # WeeklyReportForm, ExecutiveReportView,
│   │   │                 # ReportsPageClient, GlobalReportsView
│   │   ├── score/        # ScoreForm, ScorePageClient
│   │   └── charts/       # LeadsChart, RevenueChart (Recharts)
│   │
│   ├── lib/
│   │   ├── supabase/       # client.ts (browser), server.ts (RSC/Server Actions),
│   │   │                   # middleware.ts (sessão + rotas protegidas)
│   │   ├── types/database.ts # Tipos espelhando o schema do Supabase
│   │   ├── data/
│   │   │   ├── mock-data.ts    # Dados de demonstração (3 clientes fictícios)
│   │   │   └── aggregations.ts # Cálculos de dashboard/overview a partir dos dados
│   │   ├── labels/          # Mapas de status/prioridade → label + cor
│   │   ├── auth/            # DemoRoleProvider (alternância de perfil em demo)
│   │   └── utils/           # format.ts (moeda/data/número), calculations.ts
│   │                        # (CPL, ROI, ROAS, ticket médio, crescimento)
│   └── middleware.ts        # Protege rotas e renova a sessão do Supabase
│
├── supabase/
│   ├── schema.sql    # Tabelas, enums, índices, triggers de updated_at
│   ├── policies.sql  # Row Level Security (RLS) por papel e organização
│   └── seed.sql      # Dados de demonstração para popular um projeto real
│
├── .env.example
└── README.md
```

### Por que essa estrutura

- **Grupo de rotas `(app)`** isola tudo que exige autenticação atrás de um único
  `layout.tsx` com sidebar/topbar, sem afetar a URL.
- **`lib/data/mock-data.ts` + `lib/data/aggregations.ts`** concentram os dados de
  demonstração e os cálculos, para que trocar por consultas reais ao Supabase seja
  uma mudança localizada, não uma reescrita de tela.
- **Componentes de página terminam em `PageClient`** quando precisam de estado
  (formulário aberto/fechado, filtros, etc.) — o `page.tsx` correspondente é um
  Server Component que busca os dados e apenas repassa para o client component.

---

## 2. Esquema do banco de dados

Tabelas (todas com `id uuid`, `created_at`, `updated_at`) — definidas em
[`supabase/schema.sql`](supabase/schema.sql):

| Tabela | Propósito |
|---|---|
| `organizations` | A agência (Elevra Digital) — preparado para múltiplas organizações no futuro |
| `profiles` | Um perfil por usuário autenticado, com `role` (admin/consultor/cliente) |
| `organization_members` | Vínculo explícito entre organização e perfil |
| `clients` | Clientes da agência e seus dados cadastrais/metas |
| `client_members` | Quem tem acesso a cada cliente (consultores atribuídos + usuário do cliente) |
| `kpi_entries` | Registros de métricas por dia/semana/mês e canal |
| `campaigns` | Campanhas de marketing |
| `content_calendar` | Itens do calendário de conteúdo/campanhas |
| `tasks` | Tarefas por cliente |
| `weekly_reports` | Relatórios semanais preenchidos pelo consultor |
| `elevra_scores` | Avaliações de 0–100 nos 5 pilares (marketing, comercial, estrutura, operação, atendimento) |
| `activity_logs` | Trilha de auditoria (quem fez o quê, quando) |

Os indicadores calculados (CPL, conversão, ROI, ROAS, ticket médio, crescimento) **não
são persistidos** — são sempre derivados em `lib/utils/calculations.ts`, com proteção
contra divisão por zero (retornam `null`, exibido como "—" na interface).

---

## 3. Como rodar localmente

```bash
npm install --legacy-peer-deps   # necessário por um conflito de peer do @hookform/resolvers
npm run dev
```

Abra http://localhost:3000. Sem nenhuma configuração adicional, o sistema roda em
**modo de demonstração**: login com qualquer e-mail/senha, dados fictícios dos 3
clientes de exemplo, e um seletor de perfil (Administrador/Consultor/Cliente) no
canto superior direito para visualizar como a navegação muda por papel.

---

## 4. Conectando um projeto Supabase real

1. Crie um projeto em supabase.com.
2. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.
3. Copie `.env.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. No **SQL Editor** do Supabase, rode nesta ordem:
   1. `supabase/schema.sql`
   2. `supabase/policies.sql`
   3. *(opcional)* `supabase/seed.sql` — popula os 3 clientes de demonstração.
      Antes de rodar, crie os usuários indicados no topo do arquivo em
      **Authentication → Users → Invite user**.
5. Reinicie o servidor (`npm run dev`). O aviso de "modo de demonstração" desaparece
   e os formulários passam a gravar no banco real.

### Convidar novos usuários

A criação de contas (Administrador/Consultor/Cliente) deve passar por uma Server
Action ou Route Handler que usa a **service role key** no servidor
(`supabase.auth.admin.createUser`), nunca pelo navegador. Essa é uma integração
proposital deixada para a próxima etapa — o schema e as políticas de RLS já estão
prontos para recebê-la (ver comentário em `supabase/policies.sql`, seção `profiles`).

---

## 5. Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas (`supabase/policies.sql`):
  - Administradores acessam todos os clientes da própria organização.
  - Consultores acessam apenas os clientes atribuídos (`client_members`).
  - Clientes acessam apenas os dados da própria empresa, em modo leitura (exceto
    atualização do status das próprias tarefas).
  - Nenhum usuário acessa dados de outra organização — toda policy filtra por
    `organization_id = my_organization_id()`.
- **A service role key nunca é usada no navegador.** O cliente Supabase do lado do
  cliente (`lib/supabase/client.ts`) usa apenas a `anon key`, que é segura para expor
  publicamente — a segurança real vem das policies de RLS, não do sigilo da chave.
- Variáveis sem o prefixo `NEXT_PUBLIC_` (como `SUPABASE_SERVICE_ROLE_KEY`) nunca são
  importadas por componentes `"use client"`.

---

## 6. Responsividade e acessibilidade

- Menu lateral fixo em telas ≥ `lg` (1024px); abaixo disso, menu em gaveta (drawer)
  acionado pelo ícone de hambúrguer no topo.
- Grids de métricas colapsam de 4/5 colunas para 2 em telas pequenas; tabelas com
  scroll horizontal próprio em vez de quebrar o layout.
- Todos os campos de formulário têm `<label>` associado; foco visível via
  `focus-visible:ring` nos componentes interativos; `prefers-reduced-motion` respeitado
  em `globals.css`.

---

## 7. Publicando na Vercel

1. Suba o projeto para um repositório Git (GitHub/GitLab/Bitbucket).
2. Em vercel.com/new, importe o repositório — o framework Next.js é detectado
   automaticamente.
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (apenas se/quando implementar convites de usuário
     via Server Action — marque como "sensitive" no painel da Vercel)
4. Deploy. Builds seguintes acontecem automaticamente a cada push.
5. Em **Project Settings → Domains**, associe o domínio da Elevra Digital quando
   estiver pronto para produção.

---

## 8. Próximos passos sugeridos

- Implementar a Server Action de convite de usuários (Supabase Auth Admin).
- Trocar `lib/data/mock-data.ts` por hooks que consultam o Supabase (o formato dos
  dados já é idêntico ao schema, então a troca é direta).
- Adicionar upload de logo do cliente (Supabase Storage) para `clients.logo_url`.
- Testes automatizados (ex: Vitest + Testing Library) para os cálculos em
  `lib/utils/calculations.ts`, que são o núcleo numérico do produto.
