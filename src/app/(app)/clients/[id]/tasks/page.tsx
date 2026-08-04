import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { TasksPageClient } from "@/components/tasks/TasksPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
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

  return <TasksPageClient clientId={id} initialTasks={[]} />;
}