import { ClientsView } from "@/components/clients/ClientsView";
import { getClientListItems } from "@/lib/data/aggregations";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientsPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------------------
  // DIAGNÓSTICO TEMPORÁRIO — remover depois de identificar o problema.
  // ---------------------------------------------------------------------
  if (supabase) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("*")
      .order("company_name");

    return (
      <div style={{ padding: 24, fontFamily: "monospace", fontSize: 13, color: "#e5e5e5", background: "#111", minHeight: "100vh" }}>
        <h1 style={{ fontSize: 18, marginBottom: 16 }}>🔍 Diagnóstico temporário</h1>

        <p><strong>supabase client existe?</strong> sim</p>

        <p style={{ marginTop: 12 }}><strong>auth.getUser() → user:</strong></p>
        <pre style={{ background: "#000", padding: 12, overflow: "auto" }}>
          {JSON.stringify({ id: userData?.user?.id, email: userData?.user?.email }, null, 2)}
        </pre>

        <p style={{ marginTop: 12 }}><strong>auth.getUser() → error:</strong></p>
        <pre style={{ background: "#000", padding: 12, overflow: "auto" }}>
          {JSON.stringify(userError, null, 2) ?? "null"}
        </pre>

        <p style={{ marginTop: 12 }}><strong>select * from clients → data (quantidade: {clients?.length ?? 0}):</strong></p>
        <pre style={{ background: "#000", padding: 12, overflow: "auto" }}>
          {JSON.stringify(clients, null, 2)}
        </pre>

        <p style={{ marginTop: 12 }}><strong>select * from clients → error:</strong></p>
        <pre style={{ background: "#000", padding: 12, overflow: "auto" }}>
          {JSON.stringify(clientsError, null, 2) ?? "null"}
        </pre>
      </div>
    );
  }
  // ---------------------------------------------------------------------
  // FIM DO DIAGNÓSTICO TEMPORÁRIO
  // ---------------------------------------------------------------------

  const clients = getClientListItems();
  return <ClientsView clients={clients} />;
}
