"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { demoProfiles } from "@/lib/data/mock-data";
import type { Client } from "@/lib/types/database";

const clientSchema = z.object({
  company_name: z.string().min(2),
  owner_name: z.string().min(2),
  segment: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  website: z.string().optional().or(z.literal("")),
  city: z.string().min(2),
  contract_value: z.coerce.number().min(0),
  responsible_profile_id: z.string().min(1),
  main_goal: z.string().min(3),
  monthly_leads_goal: z.coerce.number().min(0),
  monthly_revenue_goal: z.coerce.number().min(0),
  commission_pct: z.coerce.number().min(0).max(100),
  status: z.enum(["ativo", "pausado", "em_risco", "encerrado"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientSettingsForm({ client }: { client: Client }) {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof clientSchema>, unknown, ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: client.company_name,
      owner_name: client.owner_name,
      segment: client.segment,
      email: client.email,
      phone: client.phone,
      website: client.website ?? "",
      city: client.city,
      contract_value: client.contract_value,
      responsible_profile_id: client.responsible_profile_id ?? "",
      main_goal: client.main_goal,
      monthly_leads_goal: client.monthly_leads_goal,
      monthly_revenue_goal: client.monthly_revenue_goal,
      commission_pct: 0,
      status: client.status,
    },
  });

  async function onSubmit(values: ClientFormValues) {
    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      const { error } = await supabase
        .from("clients")
        .update({ ...values, website: values.website || null })
        .eq("id", client.id);
      if (error) {
        alert("Não foi possível salvar as alterações: " + error.message);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 400));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {!isSupabaseConfigured() && (
              <p className="text-xs text-warning bg-warning-soft border border-warning/25 rounded-lg px-3 py-2">
                Supabase não configurado — alterações não serão persistidas.
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Nome da empresa" required {...register("company_name")} error={errors.company_name?.message} />
              <Input label="Nome do proprietário" required {...register("owner_name")} error={errors.owner_name?.message} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Segmento" required {...register("segment")} error={errors.segment?.message} />
              <Input label="Website" {...register("website")} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="E-mail" type="email" required {...register("email")} error={errors.email?.message} />
              <Input label="Telefone" required {...register("phone")} error={errors.phone?.message} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Cidade" required {...register("city")} error={errors.city?.message} />
              <Input label="Valor do contrato" type="number" step="0.01" required {...register("contract_value")} error={errors.contract_value?.message} />
            </div>
            <Select
              label="Responsável da Elevra"
              options={demoProfiles.map((p) => ({ label: p.full_name, value: p.id }))}
              {...register("responsible_profile_id")}
            />
            <Textarea label="Objetivo principal" required {...register("main_goal")} error={errors.main_goal?.message} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Comissão acordada (%)" type="number" step="0.1" placeholder="Ex: 10" hint="Percentual sobre o resultado gerado pelo cliente" {...register("commission_pct")} />
            <Input label="Meta mensal de leads" type="number" required {...register("monthly_leads_goal")} />
              <Input label="Meta mensal de receita" type="number" step="0.01" required {...register("monthly_revenue_goal")} />
            </div>
            <Select
              label="Status do cliente"
              options={[
                { label: "Ativo", value: "ativo" },
                { label: "Pausado", value: "pausado" },
                { label: "Em risco", value: "em_risco" },
                { label: "Encerrado", value: "encerrado" },
              ]}
              {...register("status")}
            />

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              {saved && (
                <span className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Alterações salvas
                </span>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-danger/25">
        <CardHeader>
          <CardTitle className="text-danger">Zona de risco</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-text-secondary max-w-md">
            Excluir este cliente remove permanentemente todos os KPIs, campanhas, tarefas e relatórios
            associados. Esta ação está disponível apenas para administradores.
          </p>
          <Button variant="danger" size="sm" onClick={() => alert("Exclusão disponível apenas para administradores com Supabase configurado.")}>
            <Trash2 className="h-3.5 w-3.5" />
            Excluir cliente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
