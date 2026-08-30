import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { clientStatusLabels } from "@/lib/labels";
import { initials } from "@/lib/utils/format";

// Mesma correção da lista de clientes: evita que o Next.js sirva uma
// versão em cache desatualizada dos dados deste cliente.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Tenta buscar do Supabase primeiro, fallback para mock
  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
  if (!client) notFound();

  const base = `/clients/${id}`;
  const status = clientStatusLabels[client.status];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Todos os clientes
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-hover border border-border-strong text-sm font-medium text-text-secondary">
            {initials(client.company_name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-text-primary truncate">
                {client.company_name}
              </h1>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="text-xs text-text-muted truncate">
              {client.segment} · {client.city}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        items={[
          { label: "Visão geral",    href: base },
          { label: "KPIs",           href: `${base}/kpis` },
          { label: "Marketing",      href: `${base}/marketing` },
          { label: "Calendário",     href: `${base}/calendar` },
          { label: "Tarefas",        href: `${base}/tasks` },
          { label: "Relatórios",     href: `${base}/reports` },
          { label: "Pipeline",       href: `${base}/pipeline` },
          { label: "🔑 Credenciais", href: `${base}/credentials` },
          { label: "Configurações",  href: `${base}/settings` },
        ]}
      />

      {children}
    </div>
  );
}
