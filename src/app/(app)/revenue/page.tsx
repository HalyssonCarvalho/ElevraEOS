import { PageHeader } from "@/components/ui/PageHeader";
import { RevenueDashboard } from "@/components/revenue/RevenueDashboard";

export default function RevenuePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Receitas & Comissões"
        description="Acompanhe o previsto e confirmado de cada cliente por mês."
      />
      <RevenueDashboard />
    </div>
  );
}
