import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { getLeadsForClient } from "@/lib/data/mock-pipeline";
import { PipelinePageClient } from "@/components/pipeline/PipelinePageClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    if (leads) {
      return <PipelinePageClient clientId={id} initialLeads={leads} />;
    }
  }

  const leads = getLeadsForClient(id);
  return <PipelinePageClient clientId={id} initialLeads={leads} />;
}
