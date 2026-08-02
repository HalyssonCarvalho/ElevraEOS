import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/mock-data";
import { TasksPageClient } from "@/components/tasks/TasksPageClient";
import { createClient } from "@/lib/supabase/server";
import { demoTasks } from "@/lib/data/mock-data";

export default async function ClientTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("client_id", id)
      .order("due_date");

    if (tasks) {
      return <TasksPageClient clientId={id} initialTasks={tasks} />;
    }
  }

  const tasks = demoTasks.filter((t) => t.client_id === id);
  return <TasksPageClient clientId={id} initialTasks={tasks} />;
}