import { notFound } from "next/navigation";
import { getClientById, demoElevraScores } from "@/lib/data/mock-data";
import { ScorePageClient } from "@/components/score/ScorePageClient";

export default async function ClientScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const scores = demoElevraScores.filter((s) => s.client_id === id);

  return <ScorePageClient clientId={id} initialScores={scores} />;
}
