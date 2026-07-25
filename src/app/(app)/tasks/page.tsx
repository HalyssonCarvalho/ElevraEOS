import { demoTasks } from "@/lib/data/mock-data";
import { TasksPageClient } from "@/components/tasks/TasksPageClient";

export default function GlobalTasksPage() {
  return <TasksPageClient clientId={null} initialTasks={demoTasks} />;
}
