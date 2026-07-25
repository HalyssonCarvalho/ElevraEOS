import type { UserRole } from "@/lib/types/database";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // nome do ícone lucide-react, resolvido em Sidebar.tsx
}

export function getNavItems(role: UserRole, clientId: string | null): NavItem[] {
  if (role === "cliente" && clientId) {
    return [
      { label: "Visão geral", href: `/clients/${clientId}`, icon: "LayoutDashboard" },
      { label: "KPIs", href: `/clients/${clientId}/kpis`, icon: "TrendingUp" },
      { label: "Marketing", href: `/clients/${clientId}/marketing`, icon: "Megaphone" },
      { label: "Calendário", href: `/clients/${clientId}/calendar`, icon: "CalendarDays" },
      { label: "Tarefas", href: `/clients/${clientId}/tasks`, icon: "ListChecks" },
      { label: "Relatórios", href: `/clients/${clientId}/reports`, icon: "FileText" },
    ];
  }

  return [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Clientes", href: "/clients", icon: "Building2" },
    { label: "Tarefas", href: "/tasks", icon: "ListChecks" },
    { label: "Calendário", href: "/calendar", icon: "CalendarDays" },
    { label: "Relatórios", href: "/reports", icon: "FileText" },
  ];
}
