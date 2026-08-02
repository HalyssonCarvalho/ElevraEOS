import { TasksPageClient } from "@/components/tasks/TasksPageClient";
import { createClient } from "@/lib/supabase/server";
import { demoTasks } from "@/lib/data/mock-data";

export default async function GlobalTasksPage() {
  const supabase = await createClient();

  if (supabase) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date");

    if (tasks) {
      return <TasksPageClient clientId={null} initialTasks={tasks} />;
    }
  }

  return <TasksPageClient clientId={null} initialTasks={demoTasks} />;
}