"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { clientStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate, formatNumber, initials } from "@/lib/utils/format";
import type { ClientListItem } from "@/lib/data/aggregations";

export function ClientsView({ clients }: { clients: ClientListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.company_name.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q) ||
        c.owner_name.toLowerCase().includes(q)
    );
  }, [clients, query]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description={`${clients.length} clientes na base da Elevra Digital`}
        actions={
          <Button href="/clients/new">
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, segmento ou responsável..."
          className="w-full h-10 rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Nenhum cliente encontrado"
          description="Tente ajustar sua busca ou cadastre um novo cliente."
          action={
            <Button href="/clients/new" variant="secondary" size="sm">
              <Plus className="h-4 w-4" /> Cadastrar cliente
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => {
            const status = clientStatusLabels[c.status];
            return (
              <Link key={c.id} href={`/clients/${c.id}`}>
                <Card className="p-4 hover:bg-surface-hover transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0 sm:w-64 shrink-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-hover border border-border-strong text-xs font-medium text-text-secondary">
                        {initials(c.company_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{c.company_name}</p>
                        <p className="text-xs text-text-muted truncate">{c.segment}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 text-xs">
                      <div>
                        <p className="text-text-muted mb-0.5">Responsável</p>
                        <p className="text-text-secondary">{c.responsible_profile_id ? "Rafael Nogueira" : "—"}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-0.5">Receita do mês</p>
                        <p className="text-text-secondary tabular-nums">{formatCurrency(c.monthRevenue, { compact: true })}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-0.5">Leads do mês</p>
                        <p className="text-text-secondary tabular-nums">{formatNumber(c.monthLeads)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-0.5">Score Elevra</p>
                        <p className="text-text-secondary tabular-nums">{c.score ?? "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-48 shrink-0">
                      <span className="text-xs text-text-muted hidden lg:block">
                        Próxima revisão {formatDate(c.updated_at)}
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
