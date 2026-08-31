import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a service role key.
 *
 * USO RESTRITO: apenas em rotas server-side isoladas (webhooks administrativos,
 * como /api/webhooks/ghl). NUNCA importar isto em um Server Component comum,
 * em uma Server Action de uso geral, nem em qualquer arquivo "use client".
 *
 * Esta chave ignora Row Level Security por completo — é o comportamento
 * correto para um webhook (que não tem sessão de usuário autenticado), mas
 * também significa que qualquer bug aqui pode escrever em qualquer tabela,
 * de qualquer cliente. Por isso a rota que usa este cliente valida um
 * segredo compartilhado (GHL_WEBHOOK_SECRET) antes de aceitar qualquer dado.
 *
 * Lida de SUPABASE_SERVICE_ROLE_KEY (sem o prefixo NEXT_PUBLIC_), conforme
 * o aviso já deixado em lib/supabase/server.ts.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
