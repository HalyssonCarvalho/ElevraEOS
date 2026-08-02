"use client";

import { useState } from "react";
import { Plus, Phone, Mail, DollarSign, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Lead, LeadStage } from "@/lib/data/mock-pipeline";
import { stageLabels } from "@/lib/data/mock-pipeline";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const stageConfig: Record<LeadStage, { tone: "neutral" | "accent" | "warning" | "success" | "danger"; color: string }> = {
  novo:       { tone: "accent",   color: "border-t-accent" },
  contactado: { tone: "warning",  color: "border-t-warning" },
  proposta:   { tone: "neutral",  color: "border-t-[#a855f7]" },
  fechado:    { tone: "success",  color: "border-t-success" },
  perdido:    { tone: "danger",   color: "border-t-danger" },
};

const stages: LeadStage[] = ["novo", "contactado", "proposta", "fechado", "perdido"];

function LeadCard({ lead, onMove, onDelete }: {
  lead: Lead;
  onMove: (id: string, stage: LeadStage) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-2 hover:border-border-strong transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-text-primary leading-tight">{lead.name}</span>
        <button onClick={() => onDelete(lead.id)} className="text-text-muted hover:text-danger shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
        <DollarSign className="h-3 w-3" />
        <span className="font-semibold text-text-secondary">{formatCurrency(lead.value)}</span>
        <span>·</span>
        <span>{lead.source}</span>
      </div>

      {lead.notes && (
        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{lead.notes}</p>
      )}

      <div className="flex gap-2 mt-1">
        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-accent">
          <Phone className="h-3 w-3" />{lead.phone}
        </a>
      </div>

      <select
        value={lead.stage}
        onChange={(e) => onMove(lead.id, e.target.value as LeadStage)}
        className="mt-1 w-full text-[11px] bg-surface-hover border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {stages.map((s) => (
          <option key={s} value={s}>{stageLabels[s]}</option>
        ))}
      </select>
    </div>
  );
}

function AddLeadForm({ stage, onAdd, onCancel }: {
  stage: LeadStage;
  onAdd: (lead: Lead) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [value, setValue] = useState("");
  const [source, setSource] = useState("Google Ads");

  function handleSubmit() {
    if (!name.trim()) return;
    onAdd({
      id: `lead-${Date.now()}`,
      client_id: "",
      name,
      phone,
      email,
      source,
      stage,
      value: Number(value) || 0,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return (
    <div className="bg-surface border border-accent/40 rounded-xl p-3 flex flex-col gap-2">
      <input
        autoFocus
        placeholder="Nome do lead *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-surface-hover border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <input
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full bg-surface-hover border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <input
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-surface-hover border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <input
        placeholder="Valor estimado (USD)"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-surface-hover border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="w-full bg-surface-hover border border-border rounded-lg px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {["Google Ads", "Meta Ads", "Indicação", "Orgânico", "Outro"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSubmit} className="flex-1">Adicionar</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}

export function PipelinePageClient({ clientId, initialLeads }: {
  clientId: string;
  initialLeads: Lead[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [addingIn, setAddingIn] = useState<LeadStage | null>(null);

  function moveLead(id: string, stage: LeadStage) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage } : l));
  }

  function deleteLead(id: string) {
    if (confirm("Remover este lead?")) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  }

  function addLead(lead: Lead) {
    setLeads((prev) => [...prev, { ...lead, client_id: clientId }]);
    setAddingIn(null);
  }

  const totalValue = leads.filter((l) => l.stage === "fechado").reduce((s, l) => s + l.value, 0);
  const totalPipeline = leads.filter((l) => !["fechado", "perdido"].includes(l.stage)).reduce((s, l) => s + l.value, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pipeline de Leads"
        description="Acompanhe cada lead do primeiro contato ao fechamento."
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              Em aberto: <span className="text-warning font-semibold">{formatCurrency(totalPipeline)}</span>
            </span>
            <span className="text-xs text-text-muted">
              Fechado: <span className="text-success font-semibold">{formatCurrency(totalValue)}</span>
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
          const cfg = stageConfig[stage];

          return (
            <div key={stage} className="flex flex-col gap-2 min-w-[200px]">
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl border-t-2 bg-surface border border-border ${cfg.color}`}>
                <div className="flex items-center gap-2">
                  <Badge tone={cfg.tone}>{stageLabels[stage]}</Badge>
                  <span className="text-[11px] text-text-muted">{stageLeads.length}</span>
                </div>
                <span className="text-[11px] text-text-muted">{formatCurrency(stageValue)}</span>
              </div>

              <div className="flex flex-col gap-2">
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onMove={moveLead} onDelete={deleteLead} />
                ))}

                {addingIn === stage ? (
                  <AddLeadForm stage={stage} onAdd={addLead} onCancel={() => setAddingIn(null)} />
                ) : (
                  <button
                    onClick={() => setAddingIn(stage)}
                    className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar lead
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}