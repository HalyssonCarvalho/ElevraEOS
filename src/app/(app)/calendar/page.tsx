import { demoContentCalendar } from "@/lib/data/mock-data";
import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export default function GlobalCalendarPage() {
  return <CalendarPageClient clientId={null} initialItems={demoContentCalendar} showClientColumn />;
}
