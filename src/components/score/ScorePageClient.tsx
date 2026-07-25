"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Gauge } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScoreForm } from "@/components/score/ScoreForm";
import type { ElevraScore } from "@/lib/types/database";

const pillars: { key: keyof ElevraScore; notesKey: keyof ElevraScore; label: string }[] = [
  { key: "marketing_score", notesKey: "marketing_notes", label: "Marketing" },
  { key: "comercial_score", notesKey: "comercial_notes", label: "Comercial" },
  { key: "estrutura_score", notesKey: "estrutura_notes", label: "Estrutura" },
  { key: "operacao_score", notesKey: "operacao_notes", label: "Operação" },
  { key: "atendimento_score", notesKey: "atendimento_notes", label: "Atendimento" },
];

export function ScorePageClient({
  clientId,
  initialScores,
}: {
  clientId: string;
  initialScores: ElevraScore[];
}) {
  const [scores, setScores] = useState<ElevraScore[]>(initialScores);
  const [showForm, setShowForm] = useState(false);

  const latest = useMemo(
    () => [...scores].sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null,
    [scores]
  );

  const strongest = latest
    ? pillars.reduce((max, p) => ((latest[p.key] as number) > (latest[max.key] as number) ? p : max), pillars[0])
    : null;
  const weakest = latest
    ? pillars.reduce((min, p) => ((latest[p.key] as number) < (latest[min.key] as number) ? p : min), pillars[0])
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/clients/${clientId}`}
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para visão geral
      </Link>

      <PageHeader
        title="Score Elevra"
        description="Avaliação de 0 a 100 baseada em cinco pilares de desempenho."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Fechar formulário" : "Nova avaliação"}
          </Button>
        }
      />

      {showForm && (
        <ScoreForm
          clientId={clientId}
          onAdd={(s) => {
            setScores((prev) => [s, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {!latest ? (
        <EmptyState icon={<Gauge className="h-6 w-6" />} title="Nenhuma avaliação registrada ainda" />
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="p-6 flex flex-col items-center justify-center gap-1 lg:col-span-1">
              <span className="text-4xl font-semibold tabular-nums">{latest.overall_score.toFixed(0)}</span>
              <span className="text-xs text-text-muted">Nota geral · {latest.period}</span>
            </Card>

            <Card className="p-5 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="flex flex-col gap-1 justify-center">
                  <span className="text-[11px] text-text-muted">Pilar mais forte</span>
                  <span className="text-sm font-medium text-success">
                    {strongest?.label} ({latest[strongest!.key] as number})
                  </span>
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <span className="text-[11px] text-text-muted">Pilar mais fraco</span>
                  <span className="text-sm font-medium text-danger">
                    {weakest?.label} ({latest[weakest!.key] as number})
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pilares de avaliação</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 flex flex-col gap-4">
              {pillars.map((p) => {
                const value = latest[p.key] as number;
                const notes = latest[p.notesKey] as string;
                return (
                  <div key={p.key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-primary">{p.label}</span>
                      <span className="text-sm tabular-nums text-text-secondary">{value}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
                    </div>
                    <p className="text-xs text-text-muted">{notes}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plano de ação recomendado</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <p className="text-sm text-text-secondary leading-relaxed">{latest.recommended_action_plan}</p>
            </CardContent>
          </Card>

          {scores.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução histórica</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-col divide-y divide-border">
                  {[...scores]
                    .sort((a, b) => b.created_at.localeCompare(a.created_at))
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-text-secondary">{s.period}</span>
                        <span className="tabular-nums text-text-primary font-medium">{s.overall_score.toFixed(0)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
