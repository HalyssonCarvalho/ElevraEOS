"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "login" | "reset";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabaseReady = isSupabaseConfigured();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabaseReady) {
      // Modo de demonstração: sem Supabase configurado, entra direto no
      // dashboard para permitir visualizar a interface.
      await new Promise((r) => setTimeout(r, 400));
      setLoading(false);
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Não foi possível conectar ao Supabase.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!supabaseReady) {
      await new Promise((r) => setTimeout(r, 400));
      setLoading(false);
      setMessage("Modo de demonstração: nenhum e-mail real foi enviado.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Não foi possível conectar ao Supabase.");
      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetError) {
      setError("Não foi possível enviar o e-mail de recuperação.");
      return;
    }
    setMessage("Enviamos um link de recuperação para o seu e-mail.");
  }

  return (
    <Card className="p-6">
      {!supabaseReady && (
        <div className="mb-5 flex gap-2 rounded-lg border border-warning/25 bg-warning-soft px-3 py-2.5 text-xs text-warning">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Supabase não configurado. Rodando em modo de demonstração — qualquer
            e-mail e senha entram no sistema com dados fictícios.
          </span>
        </div>
      )}

      {mode === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="voce@elevra.digital"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-xs text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setError(null);
              setMessage(null);
            }}
            className="text-xs text-text-secondary hover:text-accent text-center mt-1"
          >
            Esqueci minha senha
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <p className="text-xs text-text-secondary">
            Informe seu e-mail para receber um link de recuperação de senha.
          </p>
          <Input
            id="reset-email"
            label="E-mail"
            type="email"
            placeholder="voce@elevra.digital"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="text-xs text-danger">{error}</p>}
          {message && <p className="text-xs text-success">{message}</p>}

          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar link de recuperação
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className="text-xs text-text-secondary hover:text-accent text-center mt-1"
          >
            Voltar para o login
          </button>
        </form>
      )}
    </Card>
  );
}
