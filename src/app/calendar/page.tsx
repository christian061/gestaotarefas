"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  none: "bg-gray-400",
};

export default function CalendarPage() {
  const { columns } = useBoardStore();
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const allTasks = columns.flatMap((c) => c.tasks).filter((t) => t.dueDate);

  const tasksByDate: Record<string, typeof allTasks> = {};
  for (const task of allTasks) {
    if (!task.dueDate) continue;
    const key = task.dueDate.slice(0, 10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(task);
  }

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <PageLayout title="Calendário" subtitle="Tarefas por data de prazo">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">
              {MONTHS[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayTasks = tasksByDate[dateStr] || [];
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "min-h-[80px] rounded-lg p-1.5 border border-border/40 transition-colors hover:bg-muted/30",
                      isToday && "border-violet-500 bg-violet-500/5"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                        isToday && "bg-violet-500 text-white"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-1 text-[10px] truncate"
                          title={t.title}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", PRIORITY_COLORS[t.priority])} />
                          <span className="truncate text-muted-foreground">{t.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 2} mais</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-500" />
              Próximos Prazos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allTasks
                .filter((t) => t.dueDate && new Date(t.dueDate) >= new Date())
                .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                .slice(0, 8)
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn("h-2 w-2 rounded-full shrink-0", PRIORITY_COLORS[task.priority])} />
                      <span className="text-sm truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {task.status === "done" ? "✅ Concluído" : task.status === "in_progress" ? "🔄 Em andamento" : "⏳ A fazer"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.dueDate!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </div>
                ))}
              {allTasks.filter((t) => t.dueDate).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa com prazo definido.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
