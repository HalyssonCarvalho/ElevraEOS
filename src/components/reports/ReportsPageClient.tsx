"use client";

import { useState } from "react";
import { Plus, FileText, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WeeklyReportForm } from "@/components/reports/WeeklyReportForm";
import { ExecutiveReportView } from "@/components/reports/ExecutiveReportView";
import type { WeeklyReport } from "@/lib/types/database";
import { getClientById } from "@/lib/data/mock-data";
import { formatDate } from "@/lib/utils/format";

export function ReportsPageClient({
  clientId,
  initialReports,
}: {
  clientId: string;
  initialReports: WeeklyReport[];
}) {
  const [reports, setReports] = useState<WeeklyReport[]>(initialReports);
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState<WeeklyReport | null>(null);
  const client = getClientById(clientId)!;

  if (viewing) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" onClick={() => setViewing(null)} className="w-fit">
          <X className="h-3.5 w-3.5" />
          Fechar visualização executiva
        </Button>
        <ExecutiveReportView report={viewing} client={client} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatório semanal"
        description="Preenchimento semanal com visualização executiva pronta para o cliente."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Fechar formulário" : "Novo relatório"}
          </Button>
        }
      />

      {showForm && (
        <WeeklyReportForm
          clientId={clientId}
          onAdd={(r) => {
            setReports((prev) => [r, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {reports.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="Nenhum relatório registrado" />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <Card key={r.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{r.week_label}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">{r.key_numbers}</p>
                <p className="text-[11px] text-text-muted mt-1">Prazo: {formatDate(r.deadline)}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setViewing(r)}>
                Ver versão executiva
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
