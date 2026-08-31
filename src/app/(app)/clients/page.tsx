import { ClientsView } from "@/components/clients/ClientsView";
import { getClientListItems } from "@/lib/data/aggregations";
import { createClient } from "@/lib/supabase/server";

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
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name");

      const profileNameById = new Map(
        (profiles ?? []).map((p) => [p.id, p.full_name as string])
      );

      const clientListItems = clients.map((c) => ({
        ...c,
        monthLeads: 0,
        monthRevenue: 0,
        score: null,
        responsible_name: c.responsible_profile_id
          ? profileNameById.get(c.responsible_profile_id) ?? null
          : null,
      }));
      return <ClientsView clients={clientListItems} />;
    }
  }

  const clients = getClientListItems();
  return <ClientsView clients={clients} />;
}
