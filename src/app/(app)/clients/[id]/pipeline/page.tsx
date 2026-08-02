import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/mock-data";
import { getLeadsForClient } from "@/lib/data/mock-pipeline";
import { PipelinePageClient } from "@/components/pipeline/PipelinePageClient";

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const leads = getLeadsForClient(id);

  return <PipelinePageClient clientId={id} initialLeads={leads} />;
}