import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { ScorePageClient } from "@/components/score/ScorePageClient";
import { createClient } from "@/lib/supabase/server";

export default async function ClientScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
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

  return <ScorePageClient clientId={id} initialScores={[]} />;
}