import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI         = "https://elevra-eos.vercel.app/api/auth/google/callback";
const ENCRYPTION_KEY       = process.env.ENCRYPTION_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL(`/clients/${state}?error=google_auth_failed`, request.url)
      );
    }

    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    const accounts = await accountsRes.json();
    const accountName = accounts.accounts?.[0]?.name;

    if (!accountName) {
      return NextResponse.redirect(
        new URL(`/clients/${state}?error=no_gmb_account`, request.url)
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
        },
      }
    );

    const { data: encryptedAccess }  = await supabase.rpc("encrypt_token", { plain_text: tokens.access_token, secret: ENCRYPTION_KEY });
    const { data: encryptedRefresh } = await supabase.rpc("encrypt_token", { plain_text: tokens.refresh_token ?? "", secret: ENCRYPTION_KEY });

    await supabase.from("client_integrations").upsert({
      client_id:        state,
      provider:         "google_my_business",
      access_token:     encryptedAccess,
      refresh_token:    encryptedRefresh,
      account_name:     accountName,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    return NextResponse.redirect(
      new URL(`/clients/${state}?success=google_connected`, request.url)
    );
  } catch (e) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(
      new URL(`/clients/${state}?error=server_error`, request.url)
    );
  }
}