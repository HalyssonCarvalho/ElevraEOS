"use client";

import { useState } from "react";
import { X, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExecutiveReportView } from "@/components/reports/ExecutiveReportView";
import type { WeeklyReport } from "@/lib/types/database";
import { getClientById } from "@/lib/data/mock-data";
import { formatDate } from "@/lib/utils/format";

export function GlobalReportsView({ reports }: { reports: WeeklyReport[] }) {
  const [viewing, setViewing] = useState<WeeklyReport | null>(null);

  if (viewing) {
    const client = getClientById(viewing.client_id)!;
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
        title="Relatórios semanais"
        description="Todos os relatórios executivos registrados pela equipe."
      />

      {reports.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="Nenhum relatório registrado" />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => {
            const client = getClientById(r.client_id);
            return (
              <Card key={r.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {client?.company_name ?? "Cliente"} · {r.week_label}
                  </p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{r.key_numbers}</p>
                  <p className="text-[11px] text-text-muted mt-1">Prazo: {formatDate(r.deadline)}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setViewing(r)}>
                  Ver versão executiva
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
