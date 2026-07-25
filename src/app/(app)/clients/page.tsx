import { ClientsView } from "@/components/clients/ClientsView";
import { getClientListItems } from "@/lib/data/aggregations";

export default function ClientsPage() {
  const clients = getClientListItems();
  return <ClientsView clients={clients} />;
}
