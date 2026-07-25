"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarItemForm } from "@/components/calendar/CalendarItemForm";
import type { ContentCalendarItem } from "@/lib/types/database";
import { contentStatusLabels, contentTypeLabels } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { getClientById as lookupClient } from "@/lib/data/mock-data";

type ViewMode = "month" | "week";

export function CalendarPageClient({
  clientId,
  initialItems,
  showClientColumn,
}: {
  clientId: string | null;
  initialItems: ContentCalendarItem[];
  showClientColumn: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState(new Date("2026-07-24"));
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const days = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(anchor, { weekStartsOn: 0 });
    const end = endOfWeek(anchor, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [anchor, view]);

  function itemsForDay(day: Date) {
    return items.filter((i) => isSameDay(new Date(i.date + "T00:00:00"), day));
  }

  function goPrev() {
    setAnchor((d) => (view === "month" ? subMonths(d, 1) : subWeeks(d, 1)));
  }
  function goNext() {
    setAnchor((d) => (view === "month" ? addMonths(d, 1) : addWeeks(d, 1)));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendário de marketing"
        description="Planejamento de conteúdo e campanhas por data."
        actions={
          <Button
            onClick={() => {
              setSelectedDay(null);
              setShowForm((v) => !v);
            }}
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Fechar formulário" : "Novo item"}
          </Button>
        }
      />

      {showForm && (
        <CalendarItemForm
          clientId={clientId}
          defaultDate={selectedDay ?? undefined}
          onAdd={(item) => {
            setItems((prev) => [...prev, item]);
            setShowForm(false);
          }}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-text-primary min-w-[140px] text-center capitalize">
            {view === "month"
              ? format(anchor, "MMMM 'de' yyyy", { locale: ptBR })
              : `Semana de ${format(startOfWeek(anchor), "dd/MM")}`}
          </span>
          <button onClick={goNext} className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border-strong p-0.5">
          <button
            onClick={() => setView("month")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium",
              view === "month" ? "bg-accent-soft text-accent" : "text-text-secondary"
            )}
          >
            Mês
          </button>
          <button
            onClick={() => setView("week")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium",
              view === "week" ? "bg-accent-soft text-accent" : "text-text-secondary"
            )}
          >
            Semana
          </button>
        </div>
      </div>

      {view === "month" ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-7 bg-surface-raised/60 border-b border-border">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="px-2 py-2 text-[11px] font-medium text-text-muted text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayItems = itemsForDay(day);
              const inMonth = isSameMonth(day, anchor);
              const isToday = isSameDay(day, new Date("2026-07-24"));
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDay(day);
                    setShowForm(true);
                  }}
                  className={cn(
                    "min-h-[92px] border-b border-r border-border p-1.5 text-left flex flex-col gap-1 hover:bg-surface-hover transition-colors",
                    !inMonth && "opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] w-5 h-5 flex items-center justify-center rounded-full",
                      isToday ? "bg-accent text-white" : "text-text-muted"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayItems.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="text-[10px] truncate rounded px-1 py-0.5 bg-accent-soft text-accent"
                        title={showClientColumn ? `${lookupClient(item.client_id)?.company_name ?? ""} · ${item.campaign_name}` : item.campaign_name}
                      >
                        {showClientColumn ? `${lookupClient(item.client_id)?.company_name?.split(" ")[0] ?? ""} · ` : ""}
                        {contentTypeLabels[item.content_type]}
                      </span>
                    ))}
                    {dayItems.length > 3 && (
                      <span className="text-[10px] text-text-muted">+{dayItems.length - 3} mais</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {days.map((day) => {
            const dayItems = itemsForDay(day);
            return (
              <div key={day.toISOString()} className="rounded-xl border border-border p-3 flex flex-col gap-2 min-h-[140px]">
                <span className="text-xs font-medium text-text-secondary capitalize">
                  {format(day, "EEE, dd/MM", { locale: ptBR })}
                </span>
                {dayItems.length === 0 ? (
                  <span className="text-[11px] text-text-muted">Sem itens</span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {dayItems.map((item) => {
                      const status = contentStatusLabels[item.status];
                      return (
                        <div key={item.id} className="rounded-lg bg-surface-hover p-2 flex flex-col gap-1">
                          <span className="text-xs text-text-primary">{contentTypeLabels[item.content_type]}</span>
                          <span className="text-[11px] text-text-muted truncate">
                            {showClientColumn ? `${lookupClient(item.client_id)?.company_name} · ` : ""}
                            {item.campaign_name}
                          </span>
                          <Badge tone={status.tone} className="w-fit">
                            {status.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {items.length === 0 && (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Nenhum item no calendário"
          description="Adicione o primeiro item de conteúdo ou campanha."
        />
      )}
    </div>
  );
}
