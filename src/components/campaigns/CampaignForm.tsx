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
import type { Campaign } from "@/lib/types/database";

const campaignSchema = z.object({
  name: z.string().min(2, "Informe o nome da campanha"),
  big_idea: z.string().min(2, "Descreva a big idea"),
  objective: z.string().min(2, "Descreva o objetivo"),
  target_audience: z.string().min(2, "Descreva o público-alvo"),
  offer: z.string().min(2, "Descreva a oferta"),
  start_date: z.string().min(1, "Informe a data inicial"),
  end_date: z.string().min(1, "Informe a data final"),
  channels: z.string().min(2, "Informe ao menos um canal"),
  budget: z.coerce.number().min(0),
  leads_goal: z.coerce.number().min(0),
  sales_goal: z.coerce.number().min(0),
  status: z.enum(["planejada", "ativa", "pausada", "concluida", "cancelada"]),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export function CampaignForm({ clientId, onAdd }: { clientId: string; onAdd: (c: Campaign) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof campaignSchema>, unknown, CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { status: "planejada", budget: 0, leads_goal: 0, sales_goal: 0 },
  });

  async function onSubmit(values: CampaignFormValues) {
    const now = new Date().toISOString();
    const channels = values.channels.split(",").map((c) => c.trim()).filter(Boolean);

    const campaign: Campaign = {
      id: crypto.randomUUID(),
      client_id: clientId,
      name: values.name,
      big_idea: values.big_idea,
      objective: values.objective,
      target_audience: values.target_audience,
      offer: values.offer,
      start_date: values.start_date,
      end_date: values.end_date,
      channels,
      budget: values.budget,
      leads_goal: values.leads_goal,
      sales_goal: values.sales_goal,
      revenue_generated: 0,
      status: values.status,
      final_result: null,
      learnings: null,
      created_at: now,
      updated_at: now,
    };

    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      const { error } = await supabase.from("campaigns").insert({ ...campaign, id: undefined });
      if (error) {
        toast.error("Não foi possível salvar a campanha: " + error.message);
        return;
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }

    onAdd(campaign);
    toast.success("Campanha salva com sucesso!");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova campanha</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome da campanha" required {...register("name")} error={errors.name?.message} />
            <Input label="Canais (separados por vírgula)" required placeholder="Meta Ads, Google Ads" {...register("channels")} error={errors.channels?.message} />
          </div>
          <Textarea label="Big Idea" required {...register("big_idea")} error={errors.big_idea?.message} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Textarea label="Objetivo" required {...register("objective")} error={errors.objective?.message} />
            <Textarea label="Público-alvo" required {...register("target_audience")} error={errors.target_audience?.message} />
          </div>
          <Textarea label="Oferta" required {...register("offer")} error={errors.offer?.message} />
          <div className="grid sm:grid-cols-4 gap-4">
            <Input label="Data inicial" type="date" required {...register("start_date")} error={errors.start_date?.message} />
            <Input label="Data final" type="date" required {...register("end_date")} error={errors.end_date?.message} />
            <Input label="Orçamento" type="number" step="0.01" {...register("budget")} />
            <Select
              label="Status"
              options={[
                { label: "Planejada", value: "planejada" },
                { label: "Ativa", value: "ativa" },
                { label: "Pausada", value: "pausada" },
                { label: "Concluída", value: "concluida" },
                { label: "Cancelada", value: "cancelada" },
              ]}
              {...register("status")}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Meta de leads" type="number" {...register("leads_goal")} />
            <Input label="Meta de vendas" type="number" {...register("sales_goal")} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar campanha
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
