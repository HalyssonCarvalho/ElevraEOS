import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { CampaignsPageClient } from "@/components/campaigns/CampaignsPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientMarketingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")
      .eq("client_id", id)
      .order("start_date", { ascending: false });

    if (campaigns) {
      return <CampaignsPageClient clientId={id} initialCampaigns={campaigns} />;
    }
  }

  return <CampaignsPageClient clientId={id} initialCampaigns={[]} />;
}