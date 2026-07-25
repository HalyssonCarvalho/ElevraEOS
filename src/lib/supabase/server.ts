import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route
 * Handlers. Nunca importe este arquivo em um componente "use client".
 *
 * IMPORTANTE: a service role key NUNCA deve ser usada aqui nem em qualquer
 * código que possa ser enviado ao navegador. Ela deve existir apenas em
 * funções server-side isoladas (ex: webhooks administrativos), lidas de
 * SUPABASE_SERVICE_ROLE_KEY (sem o prefixo NEXT_PUBLIC_).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Chamado a partir de um Server Component sem permissão de escrita
          // de cookies; middleware.ts cuida da renovação de sessão nesse caso.
        }
      },
    },
  });
}
