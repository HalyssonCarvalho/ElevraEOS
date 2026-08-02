import { notFound } from "next/navigation";
import { getClientById, demoElevraScores } from "@/lib/data/mock-data";
import { ScorePageClient } from "@/components/score/ScorePageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: scores } = await supabase
      .from("elevra_scores")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    if (scores) {
      return <ScorePageClient clientId={id} initialScores={scores} />;
    }
  }

  const scores = demoElevraScores.filter((s) => s.client_id === id);
  return <ScorePageClient clientId={id} initialScores={scores} />;
}