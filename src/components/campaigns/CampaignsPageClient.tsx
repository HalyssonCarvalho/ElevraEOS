"use client";

import { useState } from "react";
import { Plus, Megaphone, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import type { Campaign } from "@/lib/types/database";
import { campaignStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";
import { calculateROI } from "@/lib/utils/calculations";

export function CampaignsPageClient({
  clientId,
  initialCampaigns,
}: {
  clientId: string;
  initialCampaigns: Campaign[];
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Marketing"
        description="Campanhas em andamento e histórico de resultados."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Fechar formulário" : "Nova campanha"}
          </Button>
        }
      />

      {showForm && (
        <CampaignForm
          clientId={clientId}
          onAdd={(c) => {
            setCampaigns((prev) => [c, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="Nenhuma campanha cadastrada"
          description="Crie a primeira campanha de marketing para este cliente."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((c) => {
            const status = campaignStatusLabels[c.status];
            const roi = calculateROI(c.revenue_generated, c.budget);
            const isOpen = expanded === c.id;
            return (
              <Card key={c.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">{c.objective}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs text-text-secondary tabular-nums">
                        {formatCurrency(c.revenue_generated, { compact: true })}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {roi === null ? "ROI —" : `ROI ${roi.toFixed(0)}%`}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <CardContent className="pt-0 border-t border-border">
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 pt-4 text-sm">
                      <Field label="Big Idea" value={c.big_idea} />
                      <Field label="Público-alvo" value={c.target_audience} />
                      <Field label="Oferta" value={c.offer} />
                      <Field label="Canais" value={c.channels.join(", ")} />
                      <Field label="Período" value={`${formatDate(c.start_date)} – ${formatDate(c.end_date)}`} />
                      <Field label="Orçamento" value={formatCurrency(c.budget)} />
                      <Field label="Meta de leads" value={formatNumber(c.leads_goal)} />
                      <Field label="Meta de vendas" value={formatNumber(c.sales_goal)} />
                      <Field label="Receita gerada" value={formatCurrency(c.revenue_generated)} />
                      {c.learnings && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-text-muted mb-1">Aprendizados</p>
                          <p className="text-text-secondary">{c.learnings}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-text-secondary">{value}</p>
    </div>
  );
}
