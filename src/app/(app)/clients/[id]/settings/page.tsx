import { notFound } from "next/navigation";
import { getClientByIdFromDB } from "@/lib/data/queries";
import { getClientById } from "@/lib/data/mock-data";
import { ClientSettingsForm } from "@/components/clients/ClientSettingsForm";
import { GoogleMyBusinessConnect } from "@/components/integrations/GoogleMyBusinessConnect";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function ClientSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client = await getClientByIdFromDB(id);
  if (!client) client = getClientById(id) ?? null;
  if (!client) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Configurações" description="Dados cadastrais e integrações deste cliente." />
      <ClientSettingsForm client={client} />
      <GoogleMyBusinessConnect clientId={id} clientName={client.company_name} />
    </div>
  );
}