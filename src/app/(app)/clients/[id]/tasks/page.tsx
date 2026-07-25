import { notFound } from "next/navigation";
import { getClientById, demoTasks } from "@/lib/data/mock-data";
import { TasksPageClient } from "@/components/tasks/TasksPageClient";

export default async function ClientTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const tasks = demoTasks.filter((t) => t.client_id === id);

  return <TasksPageClient clientId={id} initialTasks={tasks} />;
}
