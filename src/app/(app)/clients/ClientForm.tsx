"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const schema = z.object({
  company_name:         z.string().min(2),
  owner_name:           z.string().min(2),
  segment:              z.string().min(2),
  email:                z.string().email(),
  phone:                z.string().min(6),
  website:              z.string().optional(),
  city:                 z.string().min(2),
  start_date:           z.string().min(1),
  contract_value:       z.string().min(1),
  main_goal:            z.string().min(3),
  monthly_leads_goal:   z.string().min(1),
  monthly_revenue_goal: z.string().min(1),
  commission_pct:       z.string().min(1),
  status:               z.enum(["ativo", "pausado", "em_risco", "encerrado"]),
});

type FormValues = z.infer<typeof schema>;

export function ClientForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      status:     "ativo",
      start_date: new Date().toISOString().slice(0, 10),
      commission_pct: "10",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const supabase = isSupabaseConfigured() ? createClient() : null;

      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .single();

        if (!profile) throw new Error("Perfil não encontrado.");

        const { error: dbErr } = await supabase.from("clients").insert({
          company_name:         values.company_name,
          owner_name:           values.owner_name,
          segment:              values.segment,
          email:                values.email,
          phone:                values.phone,
          website:              values.website || null,
          city:                 values.city,
          start_date:           values.start_date,
          contract_value:       Number(values.contract_value),
          main_goal:            values.main_goal,
          monthly_leads_goal:   Number(values.monthly_leads_goal),
          monthly_revenue_goal: Number(values.monthly_revenue_goal),
          status:               values.status,
          organization_id:      profile.organization_id,
          responsible_profile_id: null,
          logo_url:             null,
        });

        if (dbErr) throw new Error(dbErr.message);
        toast.success("Cliente cadastrado com sucesso!");
        router.push("/clients");
      } else {
        toast.error("Supabase não configurado.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao cadastrar cliente.";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do cliente</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {error && (
            <p className="text-xs text-danger bg-danger-soft border border-danger/25 rounded-lg px-3 py-2">{error}</p>
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
            <Input label="Data de início" type="date" required {...register("start_date")} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Valor do contrato (USD/mês)" type="number" step="0.01" required {...register("contract_value")} />
            <Input label="Comissão acordada (%)" type="number" step="0.1" required {...register("commission_pct")} hint="Ex: 10 = 10% do resultado" />
          </div>
          <Textarea label="Objetivo principal" required {...register("main_goal")} error={errors.main_goal?.message} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Meta mensal de leads" type="number" required {...register("monthly_leads_goal")} />
            <Input label="Meta mensal de receita (USD)" type="number" step="0.01" required {...register("monthly_revenue_goal")} />
          </div>
          <Select
            label="Status"
            options={[
              { label: "Ativo", value: "ativo" },
              { label: "Pausado", value: "pausado" },
              { label: "Em risco", value: "em_risco" },
              { label: "Encerrado", value: "encerrado" },
            ]}
            {...register("status")}
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar cliente
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}