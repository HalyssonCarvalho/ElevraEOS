import { Sparkles } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft border border-accent-soft-border">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-text-primary">Elevra OS</h1>
            <p className="text-sm text-text-secondary mt-1">
              Entre para acompanhar marketing, vendas e resultados.
            </p>
          </div>
        </div>

        <LoginForm />

        <p className="text-center text-[11px] text-text-muted">
          Sistema interno da Elevra Digital · Acesso restrito
        </p>
      </div>
    </div>
  );
}
