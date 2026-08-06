import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils/format";

const actionLabels: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
  login:              { label: "Login",              tone: "success" },
  logout:             { label: "Logout",             tone: "neutral" },
  view_client:        { label: "Visualizou cliente", tone: "neutral" },
  view_credentials:   { label: "Visualizou senhas",  tone: "warning" },
  create_credential:  { label: "Criou credencial",   tone: "accent" },
  update_credential:  { label: "Editou credencial",  tone: "accent" },
  delete_credential:  { label: "Apagou credencial",  tone: "danger" },
  view_financial:     { label: "Visualizou financeiro", tone: "warning" },
  create_revenue:     { label: "Lançou receita",     tone: "success" },
  create_expense:     { label: "Lançou despesa",     tone: "accent" },
  export_pdf:         { label: "Exportou PDF",       tone: "neutral" },
  connect_google:     { label: "Conectou Google",    tone: "success" },
  view_pipeline:      { label: "Visualizou pipeline", tone: "neutral" },
  create_lead:        { label: "Criou lead",         tone: "success" },
  update_lead:        { label: "Moveu lead",         tone: "accent" },
};

export default async function SecurityPage() {
  const supabase = await createClient();

  let logs: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("audit_logs")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) logs = data;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Segurança & Auditoria"
        description="Registro completo de acessos e ações no sistema."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-text-muted uppercase tracking-widest">Total de eventos</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{logs.length}</span>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-warning uppercase tracking-widest">Acessos a senhas</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">
              {logs.filter((l) => l.action === "view_credentials").length}
            </span>
          </CardContent>
        </Card>
        <Card className="border-danger/30">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-danger uppercase tracking-widest">Credenciais apagadas</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">
              {logs.filter((l) => l.action === "delete_credential").length}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Log de auditoria — últimos 100 eventos</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col divide-y divide-border">
            <div className="grid grid-cols-4 gap-2 px-2 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
              <span>Data/Hora</span>
              <span>Usuário</span>
              <span>Ação</span>
              <span>Recurso</span>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">Nenhum evento registrado ainda.</p>
            ) : (
              logs.map((log) => {
                const action = actionLabels[log.action] ?? { label: log.action, tone: "neutral" as const };
                return (
                  <div key={log.id} className="grid grid-cols-4 gap-2 px-2 py-2.5 items-center hover:bg-surface-raised rounded-lg">
                    <span className="text-[11px] text-text-muted">{formatDateTime(log.created_at)}</span>
                    <span className="text-sm text-text-primary truncate">
                      {log.profiles?.full_name ?? "Sistema"}
                    </span>
                    <Badge tone={action.tone}>{action.label}</Badge>
                    <span className="text-[11px] text-text-muted truncate">
                      {log.resource}{log.resource_id ? ` #${log.resource_id.slice(0, 8)}` : ""}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}