"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const clientSchema = z.object({
  company_name: z.string().min(2, "Informe o nome da empresa"),
  owner_name: z.string().min(2, "Informe o nome do proprietário"),
  segment: z.string().min(2, "Informe o segmento"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(6, "Informe um telefone válido"),
  website: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "Informe a cidade"),
  start_date: z.string().min(1, "Informe a data de início"),
  contract_value: z.coerce.number().min(0, "Informe um valor válido"),
  responsible_profile_id: z.string().min(1, "Selecione um responsável"),
  main_goal: z.string().min(3, "Descreva o objetivo principal"),
  monthly_leads_goal: z.coerce.number().min(0),
  monthly_revenue_goal: z.coerce.number().min(0),
  status: z.enum(["ativo", "pausado", "em_risco", "encerrado"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  profiles: { id: string; full_name: string }[];
}

export function ClientForm({ profiles }: ClientFormProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof clientSchema>, unknown, ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      status: "ativo",
      contract_value: 0,
      monthly_leads_goal: 0,
      monthly_revenue_goal: 0,
    },
  });

  async function onSubmit(values: ClientFormValues) {
    const supabase = isSupabaseConfigured() ? createClient() : null;

    if (supabase) {
      const { error } = await supabase.from("clients").insert({
        ...values,
        website: values.website || null,
      });

      // CORREÇÃO: antes, o formulário mostrava "sucesso" e redirecionava
      // mesmo quando o insert falhava (ex: organization_id ausente antes da
      // migração 003, ou qualquer outro erro do banco). Agora um erro real
      // interrompe o fluxo aqui - nada de sucesso falso.
      if (error) {
        toast.error("Não foi possível salvar o cliente: " + error.message);
        return;
      }
    } else {
      // Modo de demonstração: sem Supabase configurado, apenas simula o
      // salvamento. Conecte um projeto Supabase para persistir de verdade.
      await new Promise((r) => setTimeout(r, 500));
    }

    setSubmitted(true);
    setTimeout(() => router.push("/clients"), 1200);
  }

  if (submitted) {
    return (
      <Card className="p-10 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-8 w-8 text-success" />
        <p className="text-sm font-medium text-text-primary">Cliente cadastrado com sucesso</p>
        <p className="text-xs text-text-muted">Redirecionando para a lista de clientes...</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {!isSupabaseConfigured() && (
            <p className="text-xs text-warning bg-warning-soft border border-warning/25 rounded-lg px-3 py-2">
              Supabase não configurado — este cadastro será simulado e não será salvo permanentemente.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome da empresa" required {...register("company_name")} error={errors.company_name?.message} />
            <Input label="Nome do proprietário" required {...register("owner_name")} error={errors.owner_name?.message} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Segmento" required placeholder="Ex: Estética, Imobiliário, Varejo" {...register("segment")} error={errors.segment?.message} />
            <Input label="Website" placeholder="https://" {...register("website")} error={errors.website?.message} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="E-mail" type="email" required {...register("email")} error={errors.email?.message} />
            <Input label="Telefone" required placeholder="+1 (000) 000-0000" {...register("phone")} error={errors.phone?.message} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Cidade" required {...register("city")} error={errors.city?.message} />
            <Input label="Data de início" type="date" required {...register("start_date")} error={errors.start_date?.message} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Valor do contrato (mensal)" type="number" step="0.01" required {...register("contract_value")} error={errors.contract_value?.message} />
            <Select
              label="Responsável da Elevra"
              required
              options={[
                { label: "Selecione...", value: "" },
                ...profiles.map((p) => ({ label: p.full_name, value: p.id })),
              ]}
              {...register("responsible_profile_id")}
              error={errors.responsible_profile_id?.message}
            />
          </div>

          <Textarea label="Objetivo principal" required {...register("main_goal")} error={errors.main_goal?.message} />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Meta mensal de leads" type="number" required {...register("monthly_leads_goal")} error={errors.monthly_leads_goal?.message} />
            <Input label="Meta mensal de receita" type="number" step="0.01" required {...register("monthly_revenue_goal")} error={errors.monthly_revenue_goal?.message} />
          </div>

          <Select
            label="Status do cliente"
            required
            options={[
              { label: "Ativo", value: "ativo" },
              { label: "Pausado", value: "pausado" },
              { label: "Em risco", value: "em_risco" },
              { label: "Encerrado", value: "encerrado" },
            ]}
            {...register("status")}
            error={errors.status?.message}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => router.push("/clients")}>
              Cancelar
            </Button>
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
