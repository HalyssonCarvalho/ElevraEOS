"use client";

import { useState } from "react";
import { Plus, Eye, EyeOff, Copy, Check, Pencil, Trash2, KeyRound, ExternalLink, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CredentialForm } from "@/components/credentials/CredentialForm";
import type { ClientCredential, CredentialCategory } from "@/lib/types/database";

const categoryLabels: Record<CredentialCategory, { label: string; tone: "info" | "success" | "warning" | "danger" }> = {
  social_media:    { label: "Redes sociais",   tone: "info" },
  ads:             { label: "Anúncios",         tone: "warning" },
  website:         { label: "Website",          tone: "success" },
  crm:             { label: "CRM",              tone: "info" },
  email_marketing: { label: "E-mail marketing", tone: "info" },
  analytics:       { label: "Analytics",        tone: "info" },
  hosting:         { label: "Hospedagem",       tone: "info" },
  domain:          { label: "Domínio",          tone: "info" },
  other:           { label: "Outros",           tone: "info" },
};

function CredentialRow({ credential, onEdit, onDelete }: { credential: ClientCredential; onEdit: (c: ClientCredential) => void; onDelete: (id: string) => void; }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState<"user" | "pass" | null>(null);
  const password = credential.password_plain ?? "••••••••••";

  function copy(text: string, field: "user" | "pass") {
    navigator.clipboard.writeText(text).then(() => { setCopied(field); setTimeout(() => setCopied(null), 1800); });
  }

  const cat = categoryLabels[credential.category];
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors group">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft border border-accent-soft-border">
        <KeyRound className="h-4 w-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-primary">{credential.label}</span>
          <Badge tone={cat.tone}>{cat.label}</Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="text-text-muted w-14 shrink-0">Usuário:</span>
          <span className="truncate font-mono">{credential.username}</span>
          <button onClick={() => copy(credential.username, "user")} className="ml-1 text-text-muted hover:text-accent shrink-0">
            {copied === "user" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="text-text-muted w-14 shrink-0">Senha:</span>
          <span className="font-mono tracking-wider">{visible ? password : "•".repeat(12)}</span>
          <button onClick={() => setVisible((v) => !v)} className="ml-1 text-text-muted hover:text-accent shrink-0">
            {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
          {visible && (
            <button onClick={() => copy(password, "pass")} className="text-text-muted hover:text-accent shrink-0">
              {copied === "pass" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>
        {(credential.url || credential.notes) && (
          <div className="flex flex-wrap items-center gap-3 mt-0.5">
            {credential.url && (
              <a href={credential.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline">
                <ExternalLink className="h-3 w-3" />{credential.url.replace(/^https?:\/\//, "").split("/")[0]}
              </a>
            )}
            {credential.notes && <span className="text-[11px] text-text-muted truncate max-w-xs">{credential.notes}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(credential)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => { if (confirm(`Excluir "${credential.label}"?`)) onDelete(credential.id); }} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-soft">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function CredentialsPageClient({ clientId, initialCredentials }: { clientId: string; initialCredentials: ClientCredential[]; }) {
  const [credentials, setCredentials] = useState<ClientCredential[]>(initialCredentials);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClientCredential | null>(null);

  const grouped = credentials.reduce<Record<string, ClientCredential[]>>((acc, cred) => {
    if (!acc[cred.category]) acc[cred.category] = [];
    acc[cred.category].push(cred);
    return acc;
  }, {});

  function handleSave(data: ClientCredential) {
    if (editing) setCredentials((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    else setCredentials((prev) => [...prev, data]);
    setEditing(null); setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Credenciais"
        description="Senhas e acessos dos sistemas do cliente. Visível apenas para a equipe interna."
        actions={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />Nova credencial</Button>}
      />
      <div className="flex items-start gap-2.5 rounded-xl border border-accent-soft-border bg-accent-soft px-4 py-3">
        <ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <p className="text-xs text-text-secondary">
          <span className="font-medium text-text-primary">Acesso restrito.</span> Visível apenas para administradores e consultores atribuídos.
        </p>
      </div>
      {showForm && (
        <Card><CardContent className="pt-4">
          <CredentialForm clientId={clientId} initial={editing} onSave={handleSave} onCancel={() => { setEditing(null); setShowForm(false); }} />
        </CardContent></Card>
      )}
      {credentials.length === 0 && !showForm ? (
        <EmptyState icon={<KeyRound className="h-6 w-6" />} title="Nenhuma credencial" description="Adicione senhas e acessos dos sistemas deste cliente."
          action={<Button onClick={() => setShowForm(true)} size="sm"><Plus className="h-4 w-4" />Adicionar</Button>}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {(Object.entries(grouped) as [CredentialCategory, ClientCredential[]][]).map(([category, creds]) => (
            <div key={category} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">{categoryLabels[category].label}</h3>
              <div className="flex flex-col gap-2">
                {creds.map((cred) => (
                  <CredentialRow key={cred.id} credential={cred}
                    onEdit={(c) => { setEditing(c);
                      setShowForm(true); }}
                    onDelete={(id) => setCredentials((prev) => prev.filter((c) => c.id !== id))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}