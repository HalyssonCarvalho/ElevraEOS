"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  ListChecks,
  CalendarDays,
  FileText,
  TrendingUp,
  Megaphone,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useDemoRole } from "@/lib/auth/demo-role-context";
import { getNavItems } from "@/components/layout/nav-items";

const iconMap = {
  LayoutDashboard,
  Building2,
  ListChecks,
  CalendarDays,
  FileText,
  TrendingUp,
  Megaphone,
};

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { role, clientId } = useDemoRole();
  const items = getNavItems(role, clientId);

  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-surface border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft border border-accent-soft-border">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="text-sm font-semibold">Elevra OS</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary" aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {items.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
