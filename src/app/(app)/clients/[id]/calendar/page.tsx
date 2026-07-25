import { notFound } from "next/navigation";
import { getClientById, demoContentCalendar } from "@/lib/data/mock-data";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export default async function ClientCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const items = demoContentCalendar.filter((c) => c.client_id === id);

  return <CalendarPageClient clientId={id} initialItems={items} showClientColumn={false} />;
}
