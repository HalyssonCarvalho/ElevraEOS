import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types/database";

export async function getClientByIdFromDB(id: string): Promise<Client | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Client;
}

export async function getAllClientsFromDB(): Promise<Client[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("company_name");

  return (data ?? []) as Client[];
}