"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { KpiEntry } from "@/lib/types/database";

const kpiSchema = z.object({
  period_type: z.enum(["dia", "semana", "mes"]),
  period_start: z.string().min(1, "Informe a data inicial"),
  period_end: z.string().min(1, "Informe a data final"),
  channel: z.string().min(2, "Informe o canal"),
  investment: z.coerce.number().min(0),
  impressions: z.coerce.number().min(0),
  reach: z.coerce.number().min(0),
  clicks: z.coerce.number().min(0),
  leads: z.coerce.number().min(0),
  appointments: z.coerce.number().min(0),
  quotes: z.coerce.number().min(0),
  sales: z.coerce.number().min(0),
  revenue: z.coerce.number().min(0),
  reviews: z.coerce.number().min(0),
  notes: z.string().optional().or(z.literal("")),
});

type KpiFormValues = z.infer<typeof kpiSchema>;

export function KpiForm({ clientId, onAdd }: { clientId: string; onAdd: (entry: KpiEntry) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.input<typeof kpiSchema>, unknown, KpiFormValues>({
    resolver: zodResolver(kpiSchema),
    defaultValues: {
      period_type: "semana",
      investment: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      leads: 0,
      appointments: 0,
      quotes: 0,
      sales: 0,
      revenue: 0,
      reviews: 0,
    },
  });

  async function onSubmit(values: KpiFormValues) {
    const average_ticket = values.sales > 0 ? Math.round((values.revenue / values.sales) * 100) / 100 : 0;
    const now = new Date().toISOString();

    const entry: KpiEntry = {
      id: crypto.randomUUID(),
      client_id: clientId,
      ...values,
      notes: values.notes || null,
      average_ticket,
      created_by: null,
      created_at: now,
      updated_at: now,
    };

    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      const { error } = await supabase.from("kpi_entries").insert({
        client_id: clientId,
        ...values,
        notes: values.notes || null,
        average_ticket,
      });
      if (error) {
        alert("Não foi possível salvar o KPI: " + error.message);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }

    onAdd(entry);
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo registro de KPI</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {!isSupabaseConfigured() && (
          <p className="text-xs text-warning bg-warning-soft border border-warning/25 rounded-lg px-3 py-2 mb-4">
            Supabase não configurado — este registro ficará disponível apenas nesta sessão.
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-4 gap-4">
            <Select
              label="Período"
              options={[
                { label: "Dia", value: "dia" },
                { label: "Semana", value: "semana" },
                { label: "Mês", value: "mes" },
              ]}
              {...register("period_type")}
            />
            <Input label="Início" type="date" required {...register("period_start")} error={errors.period_start?.message} />
            <Input label="Fim" type="date" required {...register("period_end")} error={errors.period_end?.message} />
            <Input label="Canal" required placeholder="Meta Ads, Google Ads..." {...register("channel")} error={errors.channel?.message} />
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <Input label="Investimento" type="number" step="0.01" {...register("investment")} />
            <Input label="Impressões" type="number" {...register("impressions")} />
            <Input label="Alcance" type="number" {...register("reach")} />
            <Input label="Cliques" type="number" {...register("clicks")} />
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <Input label="Leads" type="number" {...register("leads")} />
            <Input label="Agendamentos" type="number" {...register("appointments")} />
            <Input label="Orçamentos" type="number" {...register("quotes")} />
            <Input label="Vendas" type="number" {...register("sales")} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Receita" type="number" step="0.01" {...register("revenue")} />
            <Input label="Avaliações" type="number" {...register("reviews")} />
            <Input label="Ticket médio" value="Calculado automaticamente" disabled hint="Receita ÷ vendas" />
          </div>

          <Textarea label="Observações" {...register("notes")} />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar registro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
