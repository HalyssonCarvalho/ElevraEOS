import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { ReportsPageClient } from "@/components/reports/ReportsPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
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

  return <ReportsPageClient clientId={id} initialReports={[]} />;
}