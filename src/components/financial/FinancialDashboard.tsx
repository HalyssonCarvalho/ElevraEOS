"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Expense, ExpenseCategory } from "@/lib/types/database";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

const categoryLabels: Record<ExpenseCategory, { label: string; tone: "danger" | "warning" | "neutral" | "accent" | "success" }> = {
  equipe:          { label: "Equipe",          tone: "danger" },
  ferramentas:     { label: "Ferramentas",     tone: "warning" },
  ads:             { label: "Ads próprios",    tone: "accent" },
  infraestrutura:  { label: "Infraestrutura",  tone: "neutral" },
  outros:          { label: "Outros",          tone: "neutral" },
};

const categoryOptions = Object.entries(categoryLabels).map(([value, { label }]) => ({ label, value }));

interface ExpenseFormData {
  description: string;
  category: ExpenseCategory;
  amount: string;
  month: string;
  client_id: string;
}

export function FinancialDashboard({ revenues }: { revenues: { commission_value: number; status: string; month: string; client_id: string }[] }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ExpenseFormData>({
    description: "",
    category: "outros",
    amount: "",
    month: new Date().toISOString().slice(0, 7),
    client_id: "",
  });

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    async function fetch() {
      const supabase = isSupabaseConfigured() ? createClient() : null;
      if (supabase) {
        const { data } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
        if (data) setExpenses(data);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  const currentRevenues = revenues.filter((r) => r.month === currentMonth);
  const totalRevenue    = currentRevenues.reduce((s, r) => s + r.commission_value, 0);
  const confirmedRevenue = currentRevenues.filter((r) => r.status === "confirmado").reduce((s, r) => s + r.commission_value, 0);

  const currentExpenses = expenses.filter((e) => e.month === currentMonth);
  const totalExpenses   = currentExpenses.reduce((s, e) => s + e.amount, 0);
  const margin          = confirmedRevenue - totalExpenses;
  const marginPct       = confirmedRevenue > 0 ? (margin / confirmedRevenue) * 100 : 0;

  const expensesByCategory = categoryOptions.map(({ value, label }) => ({
    category: value as ExpenseCategory,
    label,
    total: currentExpenses.filter((e) => e.category === value).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  async function handleSave() {
    if (!form.description || !form.amount) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const supabase = isSupabaseConfigured() ? createClient() : null;
      const payload = {
        description: form.description,
        category:    form.category,
        amount:      Number(form.amount),
        month:       form.month,
        client_id:   form.client_id || null,
      };

      if (supabase) {
        const { data: profile } = await supabase.from("profiles").select("organization_id").single();
        if (!profile) throw new Error("Perfil não encontrado.");
        const { data, error } = await supabase.from("expenses").insert({ ...payload, organization_id: profile.organization_id }).select().single();
        if (error) throw new Error(error.message);
        if (data) setExpenses((prev) => [data, ...prev]);
      } else {
        const newExpense: Expense = {
          id: `exp-${Date.now()}`,
          organization_id: "",
          ...payload,
          client_id: payload.client_id,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setExpenses((prev) => [newExpense, ...prev]);
      }

      toast.success("Despesa lançada!");
      setForm({ description: "", category: "outros", amount: "", month: currentMonth, client_id: "" });
      setShowForm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta despesa?")) return;
    const supabase = isSupabaseConfigured() ? createClient() : null;
    if (supabase) {
      await supabase.from("expenses").delete().eq("id", id);
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast.success("Despesa removida.");
  }

  if (loading) return <div className="text-sm text-text-muted">Carregando...</div>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro"
        description="DRE simplificado — receitas, despesas e margem real da Elevra Digital."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Lançar despesa
          </Button>
        }
      />

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-success/30 bg-success-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-success uppercase tracking-widest font-semibold">Receita confirmada</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(confirmedRevenue)}</span>
            <span className="text-xs text-text-muted">Comissões confirmadas no mês</span>
          </CardContent>
        </Card>
        <Card className="border-danger/30 bg-danger-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-danger uppercase tracking-widest font-semibold">Despesas</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(totalExpenses)}</span>
            <span className="text-xs text-text-muted">Total de custos no mês</span>
          </CardContent>
        </Card>
        <Card className={margin >= 0 ? "border-success/30 bg-success-soft/20" : "border-danger/30 bg-danger-soft/20"}>
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className={`text-xs uppercase tracking-widest font-semibold ${margin >= 0 ? "text-success" : "text-danger"}`}>
              Margem real
            </span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(margin)}</span>
            <span className="text-xs text-text-muted">{marginPct.toFixed(1)}% de margem</span>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning-soft/20">
          <CardContent className="pt-5 flex flex-col gap-1">
            <span className="text-xs text-warning uppercase tracking-widest font-semibold">Previsto</span>
            <span className="text-3xl font-bold text-text-primary tabular-nums">{formatCurrency(totalRevenue - confirmedRevenue)}</span>
            <span className="text-xs text-text-muted">Ainda não confirmado</span>
          </CardContent>
        </Card>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nova despesa</CardTitle></CardHeader>
          <CardContent className="pt-3 flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Descrição *"
                placeholder="Ex: Salário Rafael, Assinatura ClickUp..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <Select
                label="Categoria"
                options={categoryOptions}
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ExpenseCategory }))}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Valor (USD) *"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
              <Input
                label="Mês"
                type="month"
                value={form.month}
                onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Salvar despesa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DRE simplificado */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>DRE — {currentMonth}</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col divide-y divide-border">
              <div className="flex justify-between py-3 px-2">
                <span className="text-sm text-text-secondary">Receita bruta (comissões)</span>
                <span className="text-sm font-semibold text-success tabular-nums">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between py-3 px-2">
                <span className="text-sm text-text-secondary">Confirmado</span>
                <span className="text-sm tabular-nums text-text-primary">{formatCurrency(confirmedRevenue)}</span>
              </div>
              {expensesByCategory.map((c) => (
                <div key={c.category} className="flex justify-between py-3 px-2">
                  <span className="text-sm text-text-secondary">(-) {c.label}</span>
                  <span className="text-sm tabular-nums text-danger">-{formatCurrency(c.total)}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 px-2 bg-surface-raised rounded-lg mt-1">
                <span className="text-sm font-bold text-text-primary">Margem líquida</span>
                <span className={`text-sm font-bold tabular-nums ${margin >= 0 ? "text-success" : "text-danger"}`}>
                  {formatCurrency(margin)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Despesas do mês</CardTitle></CardHeader>
          <CardContent className="pt-0">
            {currentExpenses.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">Nenhuma despesa lançada ainda.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {currentExpenses.map((e) => {
                  const cat = categoryLabels[e.category as ExpenseCategory] ?? categoryLabels.outros;
                  return (
                    <div key={e.id} className="flex items-center justify-between py-2.5 px-2 group hover:bg-surface-raised rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge tone={cat.tone}>{cat.label}</Badge>
                        <span className="text-sm text-text-primary truncate">{e.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums text-danger">-{formatCurrency(e.amount)}</span>
                        <button onClick={() => handleDelete(e.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}