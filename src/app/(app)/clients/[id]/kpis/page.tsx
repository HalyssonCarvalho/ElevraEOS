import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/mock-data";
import { getKpiEntriesForClient } from "@/lib/data/aggregations";
import { KpiPageClient } from "@/components/kpis/KpiPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientKpisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: entries } = await supabase
      .from("kpi_entries")
      .select("*")
      .eq("client_id", id)
      .order("period_end", { ascending: false });

    if (entries) {
      return <KpiPageClient clientId={id} initialEntries={entries} />;
    }
  }

  const entries = getKpiEntriesForClient(id);
  return <KpiPageClient clientId={id} initialEntries={entries} />;
}