"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { logAudit } from "@/lib/security/audit";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const REDIRECT_URI     = "https://elevra-eos.vercel.app/api/auth/google/callback";

const SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

interface Integration {
  id: string;
  provider: string;
  account_name: string | null;
  last_sync_at: string | null;
  token_expires_at: string | null;
}

interface Props {
  clientId: string;
  clientName: string;
}

export function GoogleMyBusinessConnect({ clientId, clientName }: Props) {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [reviews, setReviews] = useState<{ rating: number; count: number } | null>(null);

  useEffect(() => {
    fetchIntegration();
    checkUrlParams();
  }, [clientId]);

  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "google_connected") {
      toast.success("Google Meu Negócio conectado com sucesso!");
      window.history.replaceState({}, "", window.location.pathname);
      fetchIntegration();
    }
    if (params.get("error")) {
      toast.error("Erro ao conectar Google Meu Negócio. Tente novamente.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  async function fetchIntegration() {
    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (!supabase) { setLoading(false); return; }

    const { data } = await supabase
      .from("client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("provider", "google_my_business")
      .single();

    if (data) setIntegration(data);
    setLoading(false);
  }

  function connectGoogle() {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id",     GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri",  REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope",         SCOPES);
    authUrl.searchParams.set("access_type",   "offline");
    authUrl.searchParams.set("prompt",        "consent");
    authUrl.searchParams.set("state",         clientId);
    window.location.href = authUrl.toString();
  }

  async function syncData() {
    if (!integration) return;
    setSyncing(true);
    try {
      const supabase = isSupabaseConfigured() ? createClient() : null;
      if (!supabase) return;

      // Busca dados via API route
      const res = await fetch(`/api/gmb/sync?clientId=${clientId}`);
      const data = await res.json();

      if (data.rating) {
        setReviews({ rating: data.rating, count: data.reviewCount });
        toast.success("Dados sincronizados!");
        await logAudit({ action: "connect_google", resource: "client_integrations", resource_id: clientId });
      }
    } catch {
      toast.error("Erro ao sincronizar dados.");
    } finally {
      setSyncing(false);
    }
  }

  async function disconnect() {
    if (!confirm("Desconectar o Google Meu Negócio deste cliente?")) return;
    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (!supabase || !integration) return;

    await supabase.from("client_integrations").delete().eq("id", integration.id);
    setIntegration(null);
    setReviews(null);
    toast.success("Google Meu Negócio desconectado.");
  }

  if (loading) return <div className="text-sm text-text-muted">Carregando integração...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google Meu Negócio
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-4">
        {!integration ? (
          <>
            <p className="text-sm text-text-muted">
              Conecte a conta do Google Meu Negócio de <strong>{clientName}</strong> para sincronizar avaliações e nota automaticamente.
            </p>
            <Button onClick={connectGoogle}>
              Conectar Google Meu Negócio
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm text-text-primary font-medium">Conectado</span>
                <Badge tone="success">Ativo</Badge>
              </div>
              <button onClick={disconnect} className="text-[11px] text-danger hover:underline">
                Desconectar
              </button>
            </div>

            {integration.account_name && (
              <p className="text-xs text-text-muted">Conta: {integration.account_name}</p>
            )}

            {reviews && (
              <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success-soft px-4 py-3">
                <span className="text-2xl font-bold text-text-primary">{reviews.rating.toFixed(1)}</span>
                <span className="text-warning text-lg">★</span>
                <span className="text-sm text-text-muted">({reviews.count} avaliações)</span>
              </div>
            )}

            <Button variant="secondary" size="sm" onClick={syncData} disabled={syncing}>
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sincronizar dados
            </Button>

            {integration.last_sync_at && (
              <p className="text-[11px] text-text-muted">
                Última sincronização: {new Date(integration.last_sync_at).toLocaleString("pt-BR")}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}