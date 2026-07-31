"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ClientCredential, CredentialCategory } from "@/lib/types/database";

const schema = z.object({
  label:         z.string().min(1, "Informe um nome"),
  category:      z.enum(["social_media","ads","website","crm","email_marketing","analytics","hosting","domain","other"]),
  username:      z.string().min(1, "Informe o usuário"),
  password_plain: z.string().min(1, "Informe a senha"),
  url:   z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const categoryOptions: { label: string; value: CredentialCategory }[] = [
  { label: "Redes sociais",    value: "social_media" },
  { label: "Anúncios (Ads)",   value: "ads" },
  { label: "Website / CMS",    value: "website" },
  { label: "CRM",              value: "crm" },
  { label: "E-mail marketing", value: "email_marketing" },
  { label: "Analytics",        value: "analytics" },
  { label: "Hospedagem",       value: "hosting" },
  { label: "Domínio",          value: "domain" },
  { label: "Outros",           value: "other" },
];

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("");
}

interface Props {
  clientId: string;
  initial?: ClientCredential | null;
  onSave: (cred: ClientCredential) => void;
  onCancel: () => void;
}

export function CredentialForm({ clientId, initial, onSave, onCancel }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label:          initial?.label ?? "",
      category:       initial?.category ?? "other",
      username:       initial?.username ?? "",
      password_plain: initial?.password_plain ?? "",
      url:            initial?.url ?? "",
      notes:          initial?.notes ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 300));
      onSave({
        ...(initial ?? {}),
        id:              initial?.id ?? `cred-${Date.now()}`,
        client_id:       clientId,
        organization_id: initial?.organization_id ?? "",
        label:           values.label,
        category:        values.category,
        username:        values.username,
        password_plain:  values.password_plain,
        password_enc:    "",
        url:             values.url || null,
        notes:           values.notes || null,
        created_by:      initial?.created_by ?? null,
        updated_by:      null,
        created_at:      initial?.created_at ?? new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      } as ClientCredential);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text-primary">
        {initial ? "Editar credencial" : "Nova credencial"}
      </h3>

      {error && (
        <p className="text-xs text-danger bg-danger-soft border border-danger/25 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Nome / Plataforma" placeholder="Ex: Google Ads..." required {...register("label")} error={errors.label?.message} />
        <Select label="Categoria" options={categoryOptions} {...register("category")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Usuário / E-mail" placeholder="usuario@empresa.com" required {...register("username")} error={errors.username?.message} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">Senha <span className="text-danger">*</span></label>
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Senha de acesso"
                className="w-full rounded-lg border border-border-strong bg-surface px-3 h-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent pr-10 font-mono"
                {...register("password_plain")}
              />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button type="button" onClick={() => { setValue("password_plain", generatePassword()); setShowPass(true); }} className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-border-strong bg-surface hover:bg-surface-hover text-text-muted hover:text-accent" title="Gerar senha forte">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          {errors.password_plain && <span className="text-[11px] text-danger">{errors.password_plain.message}</span>}
        </div>
      </div>

      <Input label="URL de acesso" placeholder="https://..." type="url" {...register("url")} />
      <Textarea label="Observações" placeholder="ID da conta, notas..." {...register("notes")} />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {initial ? "Salvar alterações" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
