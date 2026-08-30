import { ClientsView } from "@/components/clients/ClientsView";
import { getClientListItems } from "@/lib/data/aggregations";
import { createClient } from "@/lib/supabase/server";

// Força esta página a sempre buscar dados frescos do Supabase a cada
// requisição, em vez de usar o cache padrão do Next.js (que, sem isso,
// pode continuar servindo o resultado da primeira vez que a página rodou
// - por exemplo, "0 clientes" - mesmo depois de novos clientes serem
// cadastrados no banco).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientsPage() {
  const supabase = await createClient();

  if (supabase) {
    const { data: clients } = await supabase
      .from("clients")
      .select("*")
      .order("company_name");

    if (clients && clients.length > 0) {
      const clientListItems = clients.map((c) => ({
        ...c,
        monthLeads: 0,
        monthRevenue: 0,
        score: null,
      }));
      return <ClientsView clients={clientListItems} />;
    }
  }

  // Fallback para dados mock se Supabase não configurado ou vazio
  const clients = getClientListItems();
  return <ClientsView clients={clients} />;
}
