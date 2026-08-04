import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { CredentialsPageClient } from "@/components/credentials/CredentialsPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function CredentialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
  if (!client) notFound();

  const supabase = await createClient();

  if (supabase) {
    const { data: credentials } = await supabase
      .from("client_credentials")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    if (credentials) {
      return <CredentialsPageClient clientId={id} initialCredentials={credentials} />;
    }
  }

  return <CredentialsPageClient clientId={id} initialCredentials={[]} />;
}