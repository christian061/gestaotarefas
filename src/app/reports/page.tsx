"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBoardStore } from "@/stores/board-store";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Target } from "lucide-react";

const COLORS = ["#8b5cf6", "#f59e0b", "#a855f7", "#22c55e", "#ef4444"];

export default function ReportsPage() {
  const { columns } = useBoardStore();

  const allTasks = columns.flatMap((c) => c.tasks);
  const totalTasks = allTasks.length;
  const done = allTasks.filter((t) => t.status === "done").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const review = allTasks.filter((t) => t.status === "review").length;
  const todo = allTasks.filter((t) => t.status === "todo").length;
  const overdue = allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const completionRate = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  const statusData = [
    { name: "A Fazer", value: todo, color: "#6366f1" },
    { name: "Em Andamento", value: inProgress, color: "#f59e0b" },
    { name: "Revisão", value: review, color: "#a855f7" },
    { name: "Concluído", value: done, color: "#22c55e" },
  ];

  const priorityData = [
    { name: "Urgente", value: allTasks.filter((t) => t.priority === "urgent").length },
    { name: "Alta", value: allTasks.filter((t) => t.priority === "high").length },
    { name: "Média", value: allTasks.filter((t) => t.priority === "medium").length },
    { name: "Baixa", value: allTasks.filter((t) => t.priority === "low").length },
  ];

  const weeklyData = [
    { day: "Seg", criadas: 3, concluidas: 2 },
    { day: "Ter", criadas: 5, concluidas: 4 },
    { day: "Qua", criadas: 2, concluidas: 6 },
    { day: "Qui", criadas: 4, concluidas: 3 },
    { day: "Sex", criadas: 6, concluidas: 5 },
    { day: "Sáb", criadas: 1, concluidas: 2 },
    { day: "Dom", criadas: 2, concluidas: 1 },
  ];

  const trendData = [
    { week: "S1", taxa: 45 },
    { week: "S2", taxa: 52 },
    { week: "S3", taxa: 61 },
    { week: "S4", taxa: completionRate },
  ];

  const stats = [
    { label: "Taxa de Conclusão", value: `${completionRate}%`, icon: Target, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Concluídas", value: done, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Em Andamento", value: inProgress, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Em Atraso", value: overdue, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <PageLayout title="Relatórios" subtitle="Análise de desempenho do projeto">
      <div className="p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                Atividade Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="criadas" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Criadas" />
                  <Bar dataKey="concluidas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Concluídas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Tarefas por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Tarefas">
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completion Trend */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Tendência de Conclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="taxa" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} name="Taxa" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
