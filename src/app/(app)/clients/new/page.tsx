import { PageHeader } from "@/components/ui/PageHeader";
import { ClientForm } from "@/components/clients/ClientForm";
import { createClient } from "@/lib/supabase/server";
import { demoProfiles } from "@/lib/data/mock-data";

export default async function NewClientPage() {
  const supabase = await createClient();

  // Fallback: perfis de demonstração, usados apenas se o Supabase não
  // estiver configurado ou não retornar nenhum perfil real ainda.
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
      <PageHeader
        title="Cadastrar cliente"
        description="Preencha os dados abaixo para adicionar um novo cliente à base da Elevra Digital."
      />
      <ClientForm profiles={profiles} />
    </div>
  );
}
