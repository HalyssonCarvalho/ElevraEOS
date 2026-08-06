import type { ClientCredential } from "@/lib/types/database";

// Dados demo vazios — credenciais reais são salvas no Supabase com criptografia
export const demoCredentials: ClientCredential[] = [];

export function getCredentialsForClient(clientId: string): ClientCredential[] {
  return [];
}