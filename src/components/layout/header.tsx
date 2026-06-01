"use client";

import { Bell, Search, Filter, Plus, Pencil, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditBoardModal } from "@/components/board/edit-board-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoardStore } from "@/stores/board-store";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api";
import type { Priority } from "@/types";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onAddTask?: (columnId?: string) => void;
}

export function Header({ title = "Projeto Principal", subtitle = "Sprint 12", onAddTask }: HeaderProps) {
  const router = useRouter();
  const { searchQuery, setSearchQuery, filterPriority, setFilterPriority, columns, activeBoard } = useBoardStore();
  const { isAuthenticated, logout } = useAuthStore();
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const totalTasks = columns.reduce((sum, c) => sum + c.tasks.length, 0);
  const overdueTasks = columns.flatMap((c) => c.tasks).filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;

  return (
    <>
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {activeBoard && (
            <button
              onClick={() => setEditBoardOpen(true)}
              className="opacity-0 hover:opacity-100 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
              title="Editar quadro"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="secondary">{totalTasks} tarefas</Badge>
          {overdueTasks > 0 && (
            <Badge variant="destructive" className="text-xs">{overdueTasks} atrasada{overdueTasks > 1 ? "s" : ""}</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:flex">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64 h-9 bg-background/50"
          />
        </div>

        {/* Priority Filter */}
        <Select
          value={filterPriority}
          onValueChange={(v) => setFilterPriority(v as Priority | "all")}
        >
          <SelectTrigger className="w-36 h-9 hidden sm:flex">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>

        {/* Add Task */}
        <Button size="sm" onClick={() => onAddTask?.()} className="gap-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Tarefa</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => router.push("/notifications")}>
          <Bell className="h-4 w-4" />
          {overdueTasks > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {overdueTasks}
            </span>
          )}
        </Button>

        {/* Logout (se autenticado) */}
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              try {
                await authApi.logout();
              } catch {}
              logout();
              router.push("/auth/login");
            }}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        )}

      </div>
    </header>

    {activeBoard && (
      <EditBoardModal
        board={activeBoard!}
        open={editBoardOpen}
        onClose={() => setEditBoardOpen(false)}
      />
    )}
    </>
  );
}
