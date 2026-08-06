"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, QrCode, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function MFAPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  async function checkMFAStatus() {
    const supabase = createClient();
    if (!supabase) return;

    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === "verified");
    if (verified) setEnrolled(true);
    setChecking(false);
  }

  async function startEnrollment() {
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Elevra OS" });
      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
    } catch (e) {
      toast.error("Erro ao iniciar configuração do 2FA.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!factorId || !code) return;
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
      if (!challenge) throw new Error("Erro ao criar challenge.");

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (error) throw error;

      toast.success("2FA ativado com sucesso!");
      setEnrolled(true);
      setQrCode(null);
    } catch {
      toast.error("Código inválido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function disableMFA() {
    if (!confirm("Desativar o 2FA reduz a segurança da conta. Confirma?")) return;
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp?.find((f) => f.status === "verified");
      if (!factor) return;

      await supabase.auth.mfa.unenroll({ factorId: factor.id });
      toast.success("2FA desativado.");
      setEnrolled(false);
    } catch {
      toast.error("Erro ao desativar 2FA.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <div className="text-sm text-text-muted">Verificando status do 2FA...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <PageHeader
        title="Autenticação em dois fatores"
        description="Adicione uma camada extra de segurança à sua conta."
      />

      {enrolled ? (
        <Card className="border-success/30 bg-success-soft/20">
          <CardContent className="pt-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm font-semibold text-text-primary">2FA ativado ✅</p>
                <p className="text-xs text-text-muted">Sua conta está protegida com autenticação em dois fatores.</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={disableMFA} disabled={loading}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Desativar 2FA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Configurar 2FA</CardTitle></CardHeader>
          <CardContent className="pt-3 flex flex-col gap-4">
            {!qrCode ? (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary">
                    O 2FA adiciona uma segunda camada de segurança. Você precisará do <strong>Google Authenticator</strong> ou <strong>Authy</strong> no celular.
                  </p>
                </div>
                <Button onClick={startEnrollment} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <QrCode className="h-4 w-4" />
                  Configurar agora
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-text-secondary">
                  Escaneie o QR code abaixo com o <strong>Google Authenticator</strong> ou <strong>Authy</strong>:
                </p>
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    label="Digite o código de 6 dígitos"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                  />
                  <Button onClick={verifyCode} disabled={loading || code.length !== 6}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verificar e ativar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}