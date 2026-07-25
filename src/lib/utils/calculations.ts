import type { CalculatedMetrics, KpiEntry } from "@/lib/types/database";

/**
 * Divisão segura: retorna null (em vez de Infinity/NaN) quando o
 * denominador é zero ou inválido, para que a UI possa exibir "—".
 */
export function safeDivide(
  numerator: number | null | undefined,
  denominator: number | null | undefined
): number | null {
  if (
    numerator === null ||
    numerator === undefined ||
    denominator === null ||
    denominator === undefined ||
    denominator === 0
  ) {
    return null;
  }
  return numerator / denominator;
}

/** Custo por lead = investimento / leads */
export function calculateCPL(investment: number, leads: number): number | null {
  return safeDivide(investment, leads);
}

/** Taxa de conversão de lead para venda, em percentual */
export function calculateLeadToSaleRate(sales: number, leads: number): number | null {
  const rate = safeDivide(sales, leads);
  return rate === null ? null : rate * 100;
}

/** ROI = (receita - investimento) / investimento, em percentual */
export function calculateROI(revenue: number, investment: number): number | null {
  const roi = safeDivide(revenue - investment, investment);
  return roi === null ? null : roi * 100;
}

/** ROAS = receita / investimento */
export function calculateROAS(revenue: number, investment: number): number | null {
  return safeDivide(revenue, investment);
}

/** Ticket médio = receita / vendas */
export function calculateAverageTicket(revenue: number, sales: number): number | null {
  return safeDivide(revenue, sales);
}

/** Crescimento percentual em relação ao período anterior */
export function calculateGrowth(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

/** Calcula todos os indicadores derivados de uma entrada de KPI */
export function calculateMetricsFromEntry(
  entry: Pick<KpiEntry, "investment" | "leads" | "sales" | "revenue">,
  previousRevenue?: number
): CalculatedMetrics {
  return {
    cpl: calculateCPL(entry.investment, entry.leads),
    leadToSaleRate: calculateLeadToSaleRate(entry.sales, entry.leads),
    roi: calculateROI(entry.revenue, entry.investment),
    roas: calculateROAS(entry.revenue, entry.investment),
    averageTicket: calculateAverageTicket(entry.revenue, entry.sales),
    growthVsPrevious:
      previousRevenue !== undefined
        ? calculateGrowth(entry.revenue, previousRevenue)
        : null,
  };
}

/** Soma uma lista de entradas de KPI em um único agregado */
export function sumKpiEntries(
  entries: Pick<
    KpiEntry,
    "investment" | "impressions" | "reach" | "clicks" | "leads" | "appointments" | "quotes" | "sales" | "revenue"
  >[]
) {
  return entries.reduce(
    (acc, entry) => ({
      investment: acc.investment + (entry.investment ?? 0),
      impressions: acc.impressions + (entry.impressions ?? 0),
      reach: acc.reach + (entry.reach ?? 0),
      clicks: acc.clicks + (entry.clicks ?? 0),
      leads: acc.leads + (entry.leads ?? 0),
      appointments: acc.appointments + (entry.appointments ?? 0),
      quotes: acc.quotes + (entry.quotes ?? 0),
      sales: acc.sales + (entry.sales ?? 0),
      revenue: acc.revenue + (entry.revenue ?? 0),
    }),
    {
      investment: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      leads: 0,
      appointments: 0,
      quotes: 0,
      sales: 0,
      revenue: 0,
    }
  );
}

export function calculateElevraOverallScore(scores: {
  marketing_score: number;
  comercial_score: number;
  estrutura_score: number;
  operacao_score: number;
  atendimento_score: number;
}): number {
  const values = [
    scores.marketing_score,
    scores.comercial_score,
    scores.estrutura_score,
    scores.operacao_score,
    scores.atendimento_score,
  ];
  const sum = values.reduce((acc, v) => acc + (v ?? 0), 0);
  return Math.round((sum / values.length) * 10) / 10;
}
