import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean } | null;
  icon?: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, delta, icon, hint }: StatCardProps) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium tabular-nums pb-1",
              delta.positive ? "text-success" : "text-danger"
            )}
          >
            {delta.value}
          </span>
        )}
      </div>
      {hint && <span className="text-[11px] text-text-muted">{hint}</span>}
    </Card>
  );
}
