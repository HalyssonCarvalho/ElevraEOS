import { notFound } from "next/navigation";
import { getClientById, demoCampaigns } from "@/lib/data/mock-data";
import { CampaignsPageClient } from "@/components/campaigns/CampaignsPageClient";

export default async function ClientMarketingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const campaigns = demoCampaigns.filter((c) => c.client_id === id);

  return <CampaignsPageClient clientId={id} initialCampaigns={campaigns} />;
}
