"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ElevraScore } from "@/lib/types/database";
import { calculateElevraOverallScore } from "@/lib/utils/calculations";

const scoreSchema = z.object({
  period: z.string().min(2, "Informe o período, ex: Agosto 2026"),
  marketing_score: z.coerce.number().min(0).max(100),
  marketing_notes: z.string().min(2, "Justifique a nota de marketing"),
  comercial_score: z.coerce.number().min(0).max(100),
  comercial_notes: z.string().min(2, "Justifique a nota comercial"),
  estrutura_score: z.coerce.number().min(0).max(100),
  estrutura_notes: z.string().min(2, "Justifique a nota de estrutura"),
  operacao_score: z.coerce.number().min(0).max(100),
  operacao_notes: z.string().min(2, "Justifique a nota de operação"),
  atendimento_score: z.coerce.number().min(0).max(100),
  atendimento_notes: z.string().min(2, "Justifique a nota de atendimento"),
  recommended_action_plan: z.string().min(2, "Descreva o plano de ação recomendado"),
});

type ScoreFormValues = z.infer<typeof scoreSchema>;

export function ScoreForm({ clientId, onAdd }: { clientId: string; onAdd: (s: ElevraScore) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof scoreSchema>, unknown, ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      marketing_score: 70,
      comercial_score: 70,
      estrutura_score: 70,
      operacao_score: 70,
      atendimento_score: 70,
    },
  });

  async function onSubmit(values: ScoreFormValues) {
    const now = new Date().toISOString();
    const overall_score = calculateElevraOverallScore(values);
    const score: ElevraScore = {
      id: crypto.randomUUID(),
      client_id: clientId,
      ...values,
      overall_score,
      created_by: null,
      created_at: now,
      updated_at: now,
    };

    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      const { error } = await supabase.from("elevra_scores").insert({ ...score, id: undefined });
      if (error) {
        alert("Não foi possível salvar a avaliação: " + error.message);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }

    onAdd(score);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova avaliação de Score Elevra</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input label="Período" required placeholder="Agosto 2026" {...register("period")} error={errors.period?.message} />

          <PillarField label="Marketing" scoreField="marketing_score" notesField="marketing_notes" register={register} errors={errors} />
          <PillarField label="Comercial" scoreField="comercial_score" notesField="comercial_notes" register={register} errors={errors} />
          <PillarField label="Estrutura" scoreField="estrutura_score" notesField="estrutura_notes" register={register} errors={errors} />
          <PillarField label="Operação" scoreField="operacao_score" notesField="operacao_notes" register={register} errors={errors} />
          <PillarField label="Atendimento" scoreField="atendimento_score" notesField="atendimento_notes" register={register} errors={errors} />

          <Textarea
            label="Plano de ação recomendado"
            required
            {...register("recommended_action_plan")}
            error={errors.recommended_action_plan?.message}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar avaliação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PillarField({ label, scoreField, notesField, register, errors }: any) {
  return (
    <div className="grid sm:grid-cols-3 gap-4 pb-4 border-b border-border last:border-0">
      <div className="sm:col-span-1">
        <Input label={`${label} (0-100)`} type="number" min={0} max={100} {...register(scoreField)} error={errors[scoreField]?.message} />
      </div>
      <div className="sm:col-span-2">
        <Textarea label="Justificativa" {...register(notesField)} error={errors[notesField]?.message} />
      </div>
    </div>
  );
}
