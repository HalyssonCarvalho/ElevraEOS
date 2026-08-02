"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { WeeklyReport } from "@/lib/types/database";
import { demoProfiles } from "@/lib/data/mock-data";

const reportSchema = z.object({
  week_label: z.string().min(2, "Informe a semana analisada"),
  key_numbers: z.string().min(2, "Informe os principais números"),
  what_improved: z.string().min(2, "Descreva o que melhorou"),
  what_worsened: z.string().min(2, "Descreva o que piorou"),
  best_campaign: z.string().min(1, "Informe a campanha com melhor resultado"),
  main_bottleneck: z.string().min(2, "Descreva o principal gargalo"),
  decisions_made: z.string().min(2, "Descreva as decisões tomadas"),
  next_week_priorities: z.string().min(2, "Descreva as prioridades da próxima semana"),
  responsible_profile_id: z.string().min(1, "Selecione um responsável"),
  deadline: z.string().min(1, "Informe o prazo"),
  notes: z.string().optional().or(z.literal("")),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function WeeklyReportForm({ clientId, onAdd }: { clientId: string; onAdd: (r: WeeklyReport) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof reportSchema>, unknown, ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  async function onSubmit(values: ReportFormValues) {
    const now = new Date().toISOString();
    const report: WeeklyReport = {
      id: crypto.randomUUID(),
      client_id: clientId,
      ...values,
      notes: values.notes || null,
      created_at: now,
      updated_at: now,
    };

    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      const { error } = await supabase.from("weekly_reports").insert({ ...report, id: undefined });
      if (error) {
        toast.error("Não foi possível salvar o relatório: " + error.message);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }

    onAdd(report);
    toast.success("Relatório salvo com sucesso!");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo relatório semanal</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Semana analisada" required placeholder="13 a 19 de julho de 2026" {...register("week_label")} error={errors.week_label?.message} />
            <Input label="Prazo" type="date" required {...register("deadline")} error={errors.deadline?.message} />
          </div>
          <Textarea label="Principais números" required {...register("key_numbers")} error={errors.key_numbers?.message} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Textarea label="O que melhorou" required {...register("what_improved")} error={errors.what_improved?.message} />
            <Textarea label="O que piorou" required {...register("what_worsened")} error={errors.what_worsened?.message} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Campanha com melhor resultado" required {...register("best_campaign")} error={errors.best_campaign?.message} />
            <Textarea label="Principal gargalo" required {...register("main_bottleneck")} error={errors.main_bottleneck?.message} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Textarea label="Decisões tomadas" required {...register("decisions_made")} error={errors.decisions_made?.message} />
            <Textarea label="Prioridades da próxima semana" required {...register("next_week_priorities")} error={errors.next_week_priorities?.message} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Responsável"
              required
              options={[
                { label: "Selecione...", value: "" },
                ...demoProfiles.map((p) => ({ label: p.full_name, value: p.id })),
              ]}
              {...register("responsible_profile_id")}
              error={errors.responsible_profile_id?.message}
            />
          </div>
          <Textarea label="Observações" {...register("notes")} />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar relatório
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
