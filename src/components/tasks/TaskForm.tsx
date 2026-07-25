"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Task } from "@/lib/types/database";
import { demoClients, demoProfiles } from "@/lib/data/mock-data";

const taskSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  title: z.string().min(2, "Informe o título"),
  description: z.string().optional().or(z.literal("")),
  responsible_profile_id: z.string().min(1, "Selecione um responsável"),
  priority: z.enum(["baixa", "media", "alta", "urgente"]),
  due_date: z.string().min(1, "Informe a data de entrega"),
  category: z.string().min(2, "Informe a categoria"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({ clientId, onAdd }: { clientId: string | null; onAdd: (t: Task) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof taskSchema>, unknown, TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { client_id: clientId ?? "", priority: "media" },
  });

  async function onSubmit(values: TaskFormValues) {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      client_id: values.client_id,
      title: values.title,
      description: values.description || null,
      responsible_profile_id: values.responsible_profile_id,
      priority: values.priority,
      status: "pendente",
      due_date: values.due_date,
      category: values.category,
      created_at: now,
      updated_at: now,
    };

    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      const { error } = await supabase.from("tasks").insert({ ...task, id: undefined });
      if (error) {
        alert("Não foi possível salvar a tarefa: " + error.message);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }

    onAdd(task);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova tarefa</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
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
            <Input label="Título" required {...register("title")} error={errors.title?.message} />
          </div>
          <Textarea label="Descrição" {...register("description")} />
          <div className="grid sm:grid-cols-4 gap-4">
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
              label="Prioridade"
              options={[
                { label: "Baixa", value: "baixa" },
                { label: "Média", value: "media" },
                { label: "Alta", value: "alta" },
                { label: "Urgente", value: "urgente" },
              ]}
              {...register("priority")}
            />
            <Input label="Data de entrega" type="date" required {...register("due_date")} error={errors.due_date?.message} />
            <Input label="Categoria" required placeholder="Conteúdo, Tráfego pago..." {...register("category")} error={errors.category?.message} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar tarefa
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
