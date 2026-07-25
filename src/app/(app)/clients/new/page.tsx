import { PageHeader } from "@/components/ui/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Cadastrar cliente"
        description="Preencha os dados abaixo para adicionar um novo cliente à base da Elevra Digital."
      />
      <ClientForm />
    </div>
  );
}
