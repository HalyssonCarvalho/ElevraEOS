import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export type AuditAction =
  | "login"
  | "logout"
  | "view_client"
  | "view_credentials"
  | "create_credential"
  | "update_credential"
  | "delete_credential"
  | "view_financial"
  | "create_revenue"
  | "create_expense"
  | "export_pdf"
  | "connect_google"
  | "view_pipeline"
  | "create_lead"
  | "update_lead";

export async function logAudit({
  action,
  resource,
  resource_id,
  details,
}: {
  action: AuditAction;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createClient();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    await supabase.from("audit_logs").insert({
      user_id:    user.id,
      profile_id: profile?.id ?? null,
      action,
      resource,
      resource_id: resource_id ?? null,
      ip_address:  null, // será preenchido pelo server
      details:     details ?? null,
    });
  } catch {
    // Nunca deixa o audit log quebrar o fluxo principal
  }
}