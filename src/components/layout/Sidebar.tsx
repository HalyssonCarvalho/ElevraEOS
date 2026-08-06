"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  ListChecks,
  CalendarDays,
  FileText,
  TrendingUp,
  Megaphone,
  DollarSign,
  BarChart2,
  ShieldCheck,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useDemoRole } from "@/lib/auth/demo-role-context";
import { getNavItems } from "@/components/layout/nav-items";
import { initials } from "@/lib/utils/format";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const iconMap = {
  LayoutDashboard,
  Building2,
  ListChecks,
  CalendarDays,
  FileText,
  TrendingUp,
  Megaphone,
  DollarSign,
  BarChart2,
  ShieldCheck,
};

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  consultor: "Consultor",
  cliente: "Cliente",
};

export function Sidebar() {
  const pathname = usePathname();
  const { role, profileName, clientId } = useDemoRole();
  const items = getNavItems(role, clientId);
  const [realName, setRealName] = useState<string | null>(null);
  const [realEmail, setRealEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("user_id", user.id)
        .single();
      if (profile) {
        setRealName(profile.full_name);
        setRealEmail(profile.email);
      }
    }
    fetchProfile();
  }, []);

  const displayName = realName ?? profileName;

  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
    }
    window.location.href = "/login";
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-border bg-surface/60 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft border border-accent-soft-border">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Elevra OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== `/clients/${clientId}` &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover border border-border-strong text-[11px] font-medium text-text-secondary">
            {initials(displayName)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-text-primary truncate">{displayName}</span>
            <span className="text-[11px] text-text-muted">{realEmail ?? roleLabel[role]}</span>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto text-text-muted hover:text-text-primary p-1.5 rounded-md hover:bg-surface-hover"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}