"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import type { Client } from "@/lib/types/database";

interface Props {
  client: Client;
  metrics: {
    leads: number;
    revenue: number;
    investment: number;
    sales: number;
    cpl: number | null;
    roi: number | null;
    conversionRate: number | null;
  };
  score: number | null;
}

export function ExportPdfButton({ client, metrics, score }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const blue = [61, 125, 255] as const;
      const dark = [10, 14, 26] as const;
      const gray = [90, 100, 120] as const;
      const white = [255, 255, 255] as const;

      // Background
      doc.setFillColor(...dark);
      doc.rect(0, 0, 210, 297, "F");

      // Header bar
      doc.setFillColor(...blue);
      doc.rect(0, 0, 210, 32, "F");

      // Title
      doc.setTextColor(...white);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("ELEVRA DIGITAL", 14, 14);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Relatório Executivo do Cliente", 14, 22);

      // Date
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), 196, 22, { align: "right" });

      // Client name
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text(client.company_name, 14, 48);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(`${client.segment} · ${client.city}`, 14, 56);
      doc.text(`Responsável: ${client.owner_name}`, 14, 63);

      // Divider
      doc.setDrawColor(...blue);
      doc.setLineWidth(0.5);
      doc.line(14, 68, 196, 68);

      // Metrics title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text("KPIs do Período", 14, 78);

      // Metric cards
      const cardData = [
        { label: "Leads gerados", value: metrics.leads.toString() },
        { label: "Receita gerada", value: `$${metrics.revenue.toLocaleString("en-US")}` },
        { label: "Investimento", value: `$${metrics.investment.toLocaleString("en-US")}` },
        { label: "Vendas", value: metrics.sales.toString() },
        { label: "Custo por lead", value: metrics.cpl ? `$${metrics.cpl.toFixed(2)}` : "—" },
        { label: "ROI", value: metrics.roi ? `${metrics.roi.toFixed(1)}%` : "—" },
        { label: "Taxa de conversão", value: metrics.conversionRate ? `${metrics.conversionRate.toFixed(1)}%` : "—" },
        { label: "Score Elevra", value: score ? `${score.toFixed(0)}/100` : "—" },
      ];

      const cols = 4;
      const cardW = 43;
      const cardH = 22;
      const startX = 14;
      const startY = 84;
      const gap = 3;

      cardData.forEach((card, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (cardW + gap);
        const y = startY + row * (cardH + gap);

        doc.setFillColor(20, 28, 50);
        doc.roundedRect(x, y, cardW, cardH, 2, 2, "F");

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text(card.label.toUpperCase(), x + 3, y + 7);

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...white);
        doc.text(card.value, x + 3, y + 17);
      });

      // Goals section
      const goalsY = startY + 2 * (cardH + gap) + 14;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text("Metas do Mês", 14, goalsY);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(`Meta de leads: ${client.monthly_leads_goal} leads`, 14, goalsY + 8);
      doc.text(`Meta de receita: $${client.monthly_revenue_goal.toLocaleString("en-US")}`, 14, goalsY + 15);
      doc.text(`Valor do contrato: $${client.contract_value.toLocaleString("en-US")}/mês`, 14, goalsY + 22);

      // Goal: leads progress bar
      const barY = goalsY + 30;
      const leadsProgress = client.monthly_leads_goal > 0
        ? Math.min(100, (metrics.leads / client.monthly_leads_goal) * 100)
        : 0;

      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text(`Progresso de leads: ${leadsProgress.toFixed(0)}%`, 14, barY);
      doc.setFillColor(20, 28, 50);
      doc.roundedRect(14, barY + 3, 182, 4, 1, 1, "F");
      doc.setFillColor(...blue);
      doc.roundedRect(14, barY + 3, 182 * (leadsProgress / 100), 4, 1, 1, "F");

      // Objective
      const objY = barY + 18;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text("Objetivo Principal", 14, objY);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      const splitObj = doc.splitTextToSize(client.main_goal, 182);
      doc.text(splitObj, 14, objY + 8);

      // Footer
      doc.setFillColor(...blue);
      doc.rect(0, 285, 210, 12, "F");
      doc.setFontSize(8);
      doc.setTextColor(...white);
      doc.text("Elevra Digital — AI-Powered Growth Infrastructure", 14, 293);
      doc.text("elevra.digital", 196, 293, { align: "right" });

      doc.save(`${client.company_name.replace(/\s+/g, "_")}_relatorio.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (e) {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
      {loading ? "Gerando..." : "Exportar PDF"}
    </Button>
  );
}