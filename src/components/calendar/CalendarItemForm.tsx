"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ContentCalendarItem } from "@/lib/types/database";
import { contentTypeLabels } from "@/lib/labels";
import { demoClients, demoProfiles } from "@/lib/data/mock-data";

const itemSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  date: z.string().min(1, "Informe a data"),
  campaign_name: z.string().min(2, "Informe o nome da campanha"),
  content_type: z.enum([
    "reels",
    "stories",
    "carrossel",
    "post_estatico",
    "email",
    "sms",
    "whatsapp",
    "anuncio",
    "evento",
    "campanha_sazonal",
  ]),
  channel: z.string().min(2, "Informe o canal"),
  objective: z.string().min(2, "Informe o objetivo"),
  responsible_profile_id: z.string().min(1, "Selecione um responsável"),
  status: z.enum(["ideia", "planejado", "em_producao", "em_aprovacao", "programado", "publicado", "cancelado"]),
  cta: z.string().min(1, "Informe a CTA"),
  notes: z.string().optional().or(z.literal("")),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function CalendarItemForm({
  clientId,
  defaultDate,
  onAdd,
}: {
  clientId: string | null;
  defaultDate?: Date;
  onAdd: (item: ContentCalendarItem) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof itemSchema>, unknown, ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      client_id: clientId ?? "",
      date: defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date("2026-07-24"), "yyyy-MM-dd"),
      content_type: "post_estatico",
      status: "ideia",
    },
  });

  async function onSubmit(values: ItemFormValues) {
    const now = new Date().toISOString();
    const item: ContentCalendarItem = {
      id: crypto.randomUUID(),
      client_id: values.client_id,
      campaign_id: null,
      date: values.date,
      campaign_name: values.campaign_name,
      content_type: values.content_type,
      channel: values.channel,
      objective: values.objective,
      responsible_profile_id: values.responsible_profile_id,
      status: values.status,
      cta: values.cta,
      notes: values.notes || null,
      created_at: now,
      updated_at: now,
    };

    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      const { error } = await supabase.from("content_calendar").insert({ ...item, id: undefined });
      if (error) {
        alert("Não foi possível salvar o item: " + error.message);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }

    onAdd(item);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo item do calendário</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {!clientId && (
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
            )}
            <Input label="Data" type="date" required {...register("date")} error={errors.date?.message} />
            <Input label="Nome da campanha" required {...register("campaign_name")} error={errors.campaign_name?.message} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Tipo de conteúdo"
              options={Object.entries(contentTypeLabels).map(([value, label]) => ({ value, label }))}
              {...register("content_type")}
            />
            <Input label="Canal" required placeholder="Instagram, WhatsApp..." {...register("channel")} error={errors.channel?.message} />
            <Input label="Objetivo" required {...register("objective")} error={errors.objective?.message} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
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
            <Select
              label="Status"
              options={[
                { label: "Ideia", value: "ideia" },
                { label: "Planejado", value: "planejado" },
                { label: "Em produção", value: "em_producao" },
                { label: "Em aprovação", value: "em_aprovacao" },
                { label: "Programado", value: "programado" },
                { label: "Publicado", value: "publicado" },
                { label: "Cancelado", value: "cancelado" },
              ]}
              {...register("status")}
            />
            <Input label="CTA" required placeholder="Agende agora" {...register("cta")} error={errors.cta?.message} />
          </div>

          <Textarea label="Observações" {...register("notes")} />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar item
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
