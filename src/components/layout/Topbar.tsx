"use client";

import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { useDemoRole } from "@/lib/auth/demo-role-context";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import type { UserRole } from "@/lib/types/database";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "consultor", label: "Consultor" },
  { value: "cliente", label: "Cliente" },
];

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, setRole } = useDemoRole();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-base/85 backdrop-blur px-4 lg:px-8">
        <button
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 flex items-center">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-text-muted">Visualizando como</span>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="appearance-none rounded-lg border border-border-strong bg-surface-raised pl-3 pr-8 h-9 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
              aria-label="Alternar perfil de demonstração"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
