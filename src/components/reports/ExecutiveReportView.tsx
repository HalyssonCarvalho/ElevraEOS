import { Card } from "@/components/ui/Card";
import { Sparkles } from "lucide-react";
import type { Client, WeeklyReport } from "@/lib/types/database";
import { formatDate } from "@/lib/utils/format";
import { demoProfiles } from "@/lib/data/mock-data";

export function ExecutiveReportView({ report, client }: { report: WeeklyReport; client: Client }) {
  const responsible = demoProfiles.find((p) => p.id === report.responsible_profile_id);

  return (
    <Card className="max-w-3xl mx-auto w-full overflow-hidden">
      <div className="bg-gradient-to-br from-accent-soft/60 to-transparent px-8 py-8 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-accent">Elevra Digital</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Relatório executivo semanal</h2>
          <p className="text-sm text-text-secondary mt-1">
            {client.company_name} · {report.week_label}
          </p>
        </div>
      </div>

      <div className="p-8 flex flex-col gap-6">
        <Section title="Principais números" content={report.key_numbers} highlight />

        <div className="grid sm:grid-cols-2 gap-6">
          <Section title="O que melhorou" content={report.what_improved} tone="success" />
          <Section title="O que piorou" content={report.what_worsened} tone="danger" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Section title="Campanha com melhor resultado" content={report.best_campaign} />
          <Section title="Principal gargalo" content={report.main_bottleneck} />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Section title="Decisões tomadas" content={report.decisions_made} />
          <Section title="Prioridades da próxima semana" content={report.next_week_priorities} />
        </div>

        {report.notes && <Section title="Observações" content={report.notes} />}

        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-text-muted">
          <span>Responsável: {responsible?.full_name ?? "—"}</span>
          <span>Prazo: {formatDate(report.deadline)}</span>
        </div>
      </div>
    </Card>
  );
}

function Section({
  title,
  content,
  tone,
  highlight,
}: {
  title: string;
  content: string;
  tone?: "success" | "danger";
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={`text-[11px] font-medium uppercase tracking-wide ${
          tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-text-muted"
        }`}
      >
        {title}
      </span>
      <p className={`text-sm leading-relaxed ${highlight ? "text-text-primary font-medium" : "text-text-secondary"}`}>
        {content}
      </p>
    </div>
  );
}
