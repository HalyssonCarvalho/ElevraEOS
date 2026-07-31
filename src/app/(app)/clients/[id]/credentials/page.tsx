import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/mock-data";
import { getCredentialsForClient } from "@/lib/data/mock-credentials";
import { CredentialsPageClient } from "@/components/credentials/CredentialsPageClient";

export default async function CredentialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const credentials = getCredentialsForClient(id);

  return <CredentialsPageClient clientId={id} initialCredentials={credentials} />;
}
