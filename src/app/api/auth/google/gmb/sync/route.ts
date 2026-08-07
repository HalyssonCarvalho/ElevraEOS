import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    // Busca integração do cliente
    const { data: integration } = await supabase
      .from("client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("provider", "google_my_business")
      .single();

    if (!integration) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 });
    }

    // Descriptografa o access token
    const { data: accessToken } = await supabase
      .rpc("decrypt_token", {
        encrypted_text: integration.access_token,
        secret:         ENCRYPTION_KEY,
      });

    if (!accessToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Busca locations do GMB
    const locationsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${integration.account_name}/locations?readMask=name,title,rating,userRatingCount`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const locationsData = await locationsRes.json();
    const location = locationsData.locations?.[0];

    if (!location) {
      return NextResponse.json({ error: "Nenhuma localização encontrada" }, { status: 404 });
    }

    // Atualiza last_sync_at e location_name
    await supabase
      .from("client_integrations")
      .update({
        location_name: location.name,
        last_sync_at:  new Date().toISOString(),
      })
      .eq("id", integration.id);

    return NextResponse.json({
      rating:      location.rating ?? 0,
      reviewCount: location.userRatingCount ?? 0,
      title:       location.title,
    });
  } catch (e) {
    console.error("GMB sync error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}