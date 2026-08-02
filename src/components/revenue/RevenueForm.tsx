"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ClientRevenue } from "@/lib/types/database";
import { demoClients } from "@/lib/data/mock-data";
import { clientCommissionPct } from "@/lib/data/mock-revenue";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const schema = z.object({
  client_id:         z.string().min(1, "Selecione um cliente"),
  month:             z.string().min(1, "Informe o mês"),
  revenue_generated: z.string().min(1, "Informe a receita"),
  status:            z.enum(["previsto", "confirmado"]),
  notes:             z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSave: (revenue: ClientRevenue) => void;
  onCancel: () => void;
}

export function RevenueForm({ onSave, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      client_id:         "",
      month:             new Date().toISOString().slice(0, 7),
      revenue_generated: "",
      status:            "previsto",
      notes:             "",
    },
  });

  const watchClientId = watch("client_id");
  const watchRevenue  = watch("revenue_generated");
  const pct           = clientCommissionPct[watchClientId] ?? 0;
  const commission    = (Number(watchRevenue) * pct) / 100;

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const supabase = isSupabaseConfigured() ? createClient() : null;

      const payload = {
        client_id:         values.client_id,
        month:             values.month,
        revenue_generated: Number(values.revenue_generated),
        commission_pct:    pct,
        commission_value:  commission,
        status:            values.status,
        notes:             values.notes || null,
      };

      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .single();

        if (!profile) throw new Error("Perfil não encontrado.");

        const { data, error: dbErr } = await supabase
          .from("client_revenues")
          .insert({ ...payload, organization_id: profile.organization_id })
          .select()
          .single();

        if (dbErr) throw new Error(dbErr.message);

        toast.success("Receita lançada com sucesso!");
        onSave({
          ...data,
          created_by: null,
        } as ClientRevenue);
        return;
      }

      await new Promise((r) => setTimeout(r, 300));
      toast.success("Receita lançada com sucesso!");
      onSave({
        id:                `rev-${Date.now()}`,
        client_id:         values.client_id,
        organization_id:   "00000000-0000-0000-0000-000000000001",
        month:             values.month,
        revenue_generated: Number(values.revenue_generated),
        commission_pct:    pct,
        commission_value:  commission,
        status:            values.status,
        notes:             values.notes || null,
        created_by:        null,
        created_at:        new Date().toISOString(),
        updated_at:        new Date().toISOString(),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar.";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-text-primary">Lançar receita</h3>

      {error && (
        <p className="text-xs text-danger bg-danger-soft border border-danger/25 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label="Cliente"
          required
          options={[
            { label: "Selecione...", value: "" },
            ...demoClients.map((c) => ({ label: c.company_name, value: c.id })),
          ]}
          {...register("client_id")}
          error={errors.client_id?.message}
        />
        <Input
          label="Mês de referência"
          type="month"
          required
          {...register("month")}
          error={errors.month?.message}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Receita gerada pelo cliente (USD)"
          type="number"
          step="0.01"
          required
          {...register("revenue_generated")}
          error={errors.revenue_generated?.message}
        />
        <Select
          label="Status"
          options={[
            { label: "Previsto", value: "previsto" },
            { label: "Confirmado", value: "confirmado" },
          ]}
          {...register("status")}
        />
      </div>

      {watchClientId && Number(watchRevenue) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-success/25 bg-success-soft px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted">Sua comissão ({pct}%)</span>
            <span className="text-xl font-bold text-success tabular-nums">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(commission)}
            </span>
          </div>
        </div>
      )}

      <Textarea
        label="Observações"
        placeholder="Notas sobre este lançamento..."
        {...register("notes")}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Salvar lançamento
        </Button>
      </div>
    </form>
  );
}