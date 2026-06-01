"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useBoardStore } from "@/stores/board-store";

const productivityData = [
  { name: "Seg", completed: 0, created: 0 },
  { name: "Ter", completed: 0, created: 0 },
  { name: "Qua", completed: 0, created: 0 },
  { name: "Qui", completed: 0, created: 0 },
  { name: "Sex", completed: 0, created: 0 },
  { name: "Sáb", completed: 0, created: 0 },
  { name: "Dom", completed: 0, created: 0 },
];

const PIE_COLORS = ["#6366f1", "#f59e0b", "#a855f7", "#22c55e", "#ef4444", "#3b82f6"];

export default function DashboardPage() {
  const { columns } = useBoardStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const allTasks = columns.flatMap((c) => c.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = allTasks.filter((t) => t.status === "in_progress").length;
  const overdueTasks = allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskDistribution = columns.map((col, i) => ({
    name: col.title,
    value: col.tasks.length,
    color: PIE_COLORS[i % PIE_COLORS.length],
  })).filter((d) => d.value > 0);

  const userMap = new Map<string, { name: string; completed: number; inProgress: number }>();
  allTasks.forEach((t) => {
    if (!t.assignee) return;
    const entry = userMap.get(t.assignee.id) || { name: t.assignee.name, completed: 0, inProgress: 0 };
    if (t.status === "done") entry.completed++;
    else if (t.status === "in_progress") entry.inProgress++;
    userMap.set(t.assignee.id, entry);
  });
  const teamPerformance = Array.from(userMap.values()).slice(0, 6);

  const stats = [
    {
      title: "Total de Tarefas",
      value: totalTasks,
      change: "+12%",
      trend: "up",
      icon: Calendar,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Concluídas",
      value: completedTasks,
      change: "+8%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Em Andamento",
      value: inProgressTasks,
      change: "+2",
      trend: "up",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Atrasadas",
      value: overdueTasks,
      change: "-3",
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ paddingLeft: sidebarCollapsed ? 72 : 260 }}
        suppressHydrationWarning
      >
        <Header title="Dashboard" subtitle="Visão geral do projeto" />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className={`flex items-center text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Productivity Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-500" />
                  Produtividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="#22c55e" name="Concluídas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="created" fill="#6366f1" name="Criadas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-500" />
                  Distribuição de Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-500" />
                Desempenho da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((member) => (
                  <div key={member.name} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-violet-400 to-indigo-500 text-white text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {member.completed} concluídas
                        </span>
                      </div>
                      <Progress
                        value={member.completed + member.inProgress > 0 ? (member.completed / (member.completed + member.inProgress)) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {member.inProgress} em andamento
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-500" />
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">{completionRate}%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completedTasks} de {totalTasks} tarefas concluídas
                  </p>
                </div>
                <div className="h-24 w-24">
                  <svg viewBox="0 0 36 36" className="transform -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                      strokeDasharray={`${completionRate}, 100`}
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <MobileNav activeItem="/dashboard" />
    </div>
  );
}
