import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function FinancialPage() {
  const supabase = await createClient();

  let revenues: { commission_value: number; status: string; month: string; client_id: string }[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("client_revenues")
      .select("commission_value, status, month, client_id")
      .order("month", { ascending: false });
    if (data) revenues = data;
  }

  return <FinancialDashboard revenues={revenues} />;
}