import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface MetricCardProps {
  label: string;
  value: string;
  previousValue?: string | null;
  goalValue?: string | null;
  variation?: number | null;
}

export function MetricCard({ label, value, previousValue, goalValue, variation }: MetricCardProps) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className="text-xl font-semibold tabular-nums tracking-tight">{value}</span>
      {(previousValue || goalValue || variation !== undefined) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
          {goalValue && (
            <span>
              Meta: <span className="text-text-secondary tabular-nums">{goalValue}</span>
            </span>
          )}
          {previousValue && (
            <span>
              Período anterior: <span className="text-text-secondary tabular-nums">{previousValue}</span>
            </span>
          )}
          {variation !== undefined && variation !== null && (
            <span className={cn("font-medium tabular-nums", variation >= 0 ? "text-success" : "text-danger")}>
              {formatPercent(variation, { showSign: true })}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
