import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById, demoProfiles } from "@/lib/data/mock-data";
import { ClientSettingsForm } from "@/components/clients/ClientSettingsForm";
import { GoogleMyBusinessConnect } from "@/components/integrations/GoogleMyBusinessConnect";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
  if (!client) notFound();

  const supabase = await createClient();

  let profiles: { id: string; full_name: string }[] = demoProfiles
    .filter((p) => p.role === "consultor" || p.role === "admin")
    .map((p) => ({ id: p.id, full_name: p.full_name }));

  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["admin", "consultor"])
      .order("full_name");

    if (data && data.length > 0) {
      profiles = data;
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Configurações" description="Dados cadastrais e integrações deste cliente." />
      <ClientSettingsForm client={client} profiles={profiles} />
      <GoogleMyBusinessConnect clientId={id} clientName={client.company_name} />
    </div>
  );
}
