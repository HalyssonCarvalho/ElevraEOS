import { notFound } from "next/navigation";
import { getClientById, demoWeeklyReports } from "@/lib/data/mock-data";
import { ReportsPageClient } from "@/components/reports/ReportsPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: reports } = await supabase
      .from("weekly_reports")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    if (reports) {
      return <ReportsPageClient clientId={id} initialReports={reports} />;
    }
  }

  const reports = demoWeeklyReports.filter((r) => r.client_id === id);
  return <ReportsPageClient clientId={id} initialReports={reports} />;
}