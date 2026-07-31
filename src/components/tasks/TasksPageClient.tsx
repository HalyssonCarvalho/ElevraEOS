"use client";

import { useMemo, useState } from "react";
import { Plus, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskForm } from "@/components/tasks/TaskForm";
import type { Task, TaskStatus } from "@/lib/types/database";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils/format";
import { getClientById } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils/cn";

const columns: TaskStatus[] = ["pendente", "em_andamento", "aguardando_cliente", "concluida"];

export function TasksPageClient({
  clientId,
  initialTasks,
}: {
  clientId: string | null;
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);

  const today = new Date(); // ✅ data real

  function updateStatus(taskId: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      pendente: [],
      em_andamento: [],
      aguardando_cliente: [],
      concluida: [],
      cancelada: [],
    };
    tasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [tasks]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tarefas"
        description={clientId ? "Tarefas relacionadas a este cliente." : "Todas as tarefas da operação."}
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Fechar formulário" : "Nova tarefa"}
          </Button>
        }
      />

      {showForm && (
        <TaskForm
          clientId={clientId}
          onAdd={(t) => {
            setTasks((prev) => [t, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {tasks.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-6 w-6" />} title="Nenhuma tarefa cadastrada" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((status) => {
            const label = taskStatusLabels[status];
            return (
              <div key={status} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">{label.label}</span>
                  <span className="text-[11px] text-text-muted tabular-nums">{grouped[status].length}</span>
                </div>
                <div className="flex flex-col gap-2 min-h-[60px]">
                  {grouped[status].map((t) => {
                    const priority = taskPriorityLabels[t.priority];
                    const overdue = new Date(t.due_date) < today && status !== "concluida";
                    const client = !clientId ? getClientById(t.client_id) : null;
                    return (
                      <Card key={t.id} className="p-3 flex flex-col gap-2">
                        <p className="text-sm text-text-primary leading-snug">{t.title}</p>
                        {t.description && <p className="text-xs text-text-muted leading-snug">{t.description}</p>}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge tone={priority.tone}>{priority.label}</Badge>
                          {client && (
                            <Badge tone="neutral" className="truncate max-w-[120px]">
                              {client.company_name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("text-[11px]", overdue ? "text-danger font-medium" : "text-text-muted")}>
                            {overdue ? "Atrasada · " : ""}
                            {formatDate(t.due_date)}
                          </span>
                          <select
                            value={t.status}
                            onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                            className="text-[11px] bg-surface border border-border-strong rounded-md px-1.5 py-1 text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            {Object.entries(taskStatusLabels).map(([value, l]) => (
                              <option key={value} value={value}>
                                {l.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
