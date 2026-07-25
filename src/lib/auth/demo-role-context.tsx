"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { UserRole } from "@/lib/types/database";
import { demoProfiles } from "@/lib/data/mock-data";

/**
 * Contexto usado apenas em MODO DE DEMONSTRAÇÃO (sem Supabase configurado)
 * para permitir alternar entre os três perfis de usuário e visualizar como
 * a navegação e as permissões mudam para cada um. Quando o Supabase estiver
 * conectado, o perfil real do usuário autenticado (tabela `profiles`) deve
 * substituir esta lógica — ver src/lib/auth/get-current-profile.ts.
 */

interface DemoRoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  profileName: string;
  clientId: string | null;
}

const STORAGE_KEY = "elevra-os-demo-role";

const DemoRoleContext = createContext<DemoRoleContextValue>({
  role: "admin",
  setRole: () => {},
  profileName: demoProfiles[0].full_name,
  clientId: null,
});

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("admin");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as UserRole | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação a partir do localStorage, padrão intencional
    if (stored) setRoleState(stored);
  }, []);

  const setRole = (next: UserRole) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<DemoRoleContextValue>(() => {
    if (role === "consultor") {
      return { role, setRole, profileName: "Rafael Nogueira", clientId: null };
    }
    if (role === "cliente") {
      return { role, setRole, profileName: "Michael Costa", clientId: "client-semper-fidelis" };
    }
    return { role, setRole, profileName: "Marina Duarte", clientId: null };
  }, [role]);

  return <DemoRoleContext.Provider value={value}>{children}</DemoRoleContext.Provider>;
}

export function useDemoRole() {
  return useContext(DemoRoleContext);
}
