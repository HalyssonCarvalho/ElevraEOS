import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/mock-data";
import { getKpiEntriesForClient } from "@/lib/data/aggregations";
import { KpiPageClient } from "@/components/kpis/KpiPageClient";

export default async function ClientKpisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const entries = getKpiEntriesForClient(id);

  return <KpiPageClient clientId={id} initialEntries={entries} />;
}
