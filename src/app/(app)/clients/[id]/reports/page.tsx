import { notFound } from "next/navigation";
import { getClientById, demoWeeklyReports } from "@/lib/data/mock-data";
import { ReportsPageClient } from "@/components/reports/ReportsPageClient";

export default async function ClientReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const reports = demoWeeklyReports.filter((r) => r.client_id === id);

  return <ReportsPageClient clientId={id} initialReports={reports} />;
}
