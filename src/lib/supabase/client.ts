"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em componentes do lado do cliente ("use client").
 * As variáveis de ambiente NEXT_PUBLIC_* são seguras para expor no navegador
 * — elas identificam o projeto, mas não concedem privilégios (isso é papel
 * do Row Level Security, ver /supabase/policies.sql).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}

/** Indica se o projeto está conectado a uma instância real do Supabase. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
