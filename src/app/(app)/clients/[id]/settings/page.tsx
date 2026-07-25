import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/mock-data";
import { ClientSettingsForm } from "@/components/clients/ClientSettingsForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function ClientSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Configurações" description="Dados cadastrais e preferências deste cliente." />
      <ClientSettingsForm client={client} />
    </div>
  );
}
