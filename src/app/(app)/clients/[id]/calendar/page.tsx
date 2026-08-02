import { notFound } from "next/navigation";
import { getClientById, demoContentCalendar } from "@/lib/data/mock-data";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: items } = await supabase
      .from("content_calendar")
      .select("*")
      .eq("client_id", id)
      .order("date");

    if (items) {
      return <CalendarPageClient clientId={id} initialItems={items} showClientColumn={false} />;
    }
  }

  const items = demoContentCalendar.filter((c) => c.client_id === id);
  return <CalendarPageClient clientId={id} initialItems={items} showClientColumn={false} />;
}