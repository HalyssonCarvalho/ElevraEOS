// Formatação monetária configurável. Padrão: Real brasileiro.
// Para trocar a moeda do sistema, altere DEFAULT_CURRENCY e DEFAULT_LOCALE.

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_CURRENCY = "USD";

export function formatCurrency(
  value: number | null | undefined,
  options?: { locale?: string; currency?: string; compact?: boolean }
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const currency = options?.currency ?? DEFAULT_CURRENCY;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: options?.compact ? "compact" : "standard",
    maximumFractionDigits: options?.compact ? 1 : 2,
  }).format(value);
}

export function formatNumber(
  value: number | null | undefined,
  options?: { compact?: boolean; decimals?: number }
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    notation: options?.compact ? "compact" : "standard",
    maximumFractionDigits: options?.decimals ?? 0,
  }).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  options?: { decimals?: number; showSign?: boolean }
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  const decimals = options?.decimals ?? 1;
  const sign = options?.showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(
    DEFAULT_LOCALE,
    options ?? { day: "2-digit", month: "short", year: "numeric" }
  ).format(date);
}

export function formatDateShort(value: string | Date | null | undefined): string {
  return formatDate(value, { day: "2-digit", month: "2-digit" });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
