import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;

  const providedSecret = request.headers.get("x-webhook-secret");
  const expectedSecret = process.env.GHL_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("GHL_WEBHOOK_SECRET nao esta configurada no ambiente do Elevra OS.");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const ghlEvent = typeof body.ghl_event === "string" ? body.ghl_event : "unknown";

  function inferStage(): string {
    if (body.appointment_date) return "proposta";
    if (ghlEvent === "human_handoff_requested") return "contactado";
    return "novo";
  }

  const eventLabels: Record<string, string> = {
    entry_modal: "Site - Formulario de entrada",
    in_chat_form: "Site - Chat IA",
    pre_approval_form: "Site - Get Pre-Approved",
    appointment_booked: "Site - Agendamento confirmado",
    human_handoff_requested: "Site - Pediu falar com pessoa",
    chat_abandoned: "Site - Abandonou o chat",
  };

  const { error } = await supabase.from("leads").insert({
    client_id: clientId,
    name: (body.first_name as string) || "Lead sem nome",
    phone: (body.phone as string) || null,
    email: (body.email as string) || null,
    source: eventLabels[ghlEvent] ?? "Site - " + ghlEvent,
    stage: inferStage(),
    value: 0,
    notes: body.purchase_timeline ? "Timeline de compra: " + body.purchase_timeline : null,
    vehicle_type: (body.vehicle_type as string) || null,
    budget_range: (body.budget_range as string) || null,
    purchase_method: (body.purchase_method as string) || null,
    down_payment_range: (body.down_payment_range as string) || null,
    employment_status: (body.employment_status as string) || null,
    has_trade_in: (body.has_trade_in as string) || null,
    purchase_timeline: (body.purchase_timeline as string) || null,
    appointment_date: (body.appointment_date as string) || null,
    appointment_time: (body.appointment_time as string) || null,
    human_handoff_requested: Boolean(body.human_handoff_requested),
    lead_score: Number(body.lead_score ?? 0),
    lead_temperature: (body.lead_temperature as string) || "NURTURE",
    preferred_contact: (body.preferred_contact as string) || null,
    ghl_event: ghlEvent,
    source_sent_at: (body.sent_at as string) || null,
  });

  if (error) {
    console.error("Falha ao gravar lead vindo do GHL:", error);
    return NextResponse.json({ error: "Database error", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
