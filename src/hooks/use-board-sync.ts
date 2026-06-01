"use client";

import { useEffect, useRef } from "react";
import { boardsApi } from "@/lib/api";
import { useBoardStore } from "@/stores/board-store";
import { useAuthStore } from "@/stores/auth-store";
import type { Board, Column, Task } from "@/types";

function mapApiBoard(apiBoard: any): Board {
  return {
    id: apiBoard.id,
    title: apiBoard.title,
    description: apiBoard.description || "",
    color: apiBoard.color || "from-violet-500 to-indigo-600",
    template: apiBoard.template || "kanban",
    columns: [],
    members: (apiBoard.members || []).map((m: any) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar,
      role: m.role,
    })),
    createdAt: apiBoard.createdAt,
    updatedAt: apiBoard.updatedAt,
  };
}

function mapApiTask(apiTask: any, columnId: string): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || "",
    status: apiTask.status || columnId,
    priority: apiTask.priority || "medium",
    order: apiTask.order ?? 0,
    dueDate: apiTask.dueDate || undefined,
    timeSpent: apiTask.timeSpent || 0,
    assignee: apiTask.assignee
      ? { id: apiTask.assignee.id, name: apiTask.assignee.name, email: apiTask.assignee.email, avatar: apiTask.assignee.avatar }
      : undefined,
    labels: (apiTask.labels || []).map((l: any) => ({ id: l.id, name: l.name, color: l.color })),
    checklist: (apiTask.checklist || []).map((c: any) => ({ id: c.id, text: c.text, completed: c.completed })),
    subtasks: (apiTask.subtasks || []).map((s: any) => ({ id: s.id, title: s.title, completed: s.completed })),
    comments: (apiTask.comments || []).map((c: any) => ({
      id: c.id,
      userId: c.user?.id || c.userId || "",
      user: { id: c.user?.id || "", name: c.user?.name || "Anônimo", email: c.user?.email || "" },
      content: c.content,
      createdAt: c.createdAt,
    })),
    attachments: (apiTask.attachments || []).map((a: any) => a.fileUrl || a.url || a.fileName || String(a)),
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
}

function mapApiColumns(apiColumns: any[]): Column[] {
  return (apiColumns || []).map((col: any) => ({
    id: col.id,
    title: col.title,
    color: col.color,
    icon: col.icon,
    tasks: (col.tasks || []).map((t: any) => mapApiTask(t, col.id)),
  }));
}

export function useBoardSync() {
  const { isAuthenticated } = useAuthStore();
  const synced = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || synced.current) return;

    async function syncBoards() {
      try {
        const apiBoards = await boardsApi.list();
        if (!apiBoards || apiBoards.length === 0) return;

        const newBoardColumns: Record<string, Column[]> = {};
        const boards: Board[] = [];

        for (const apiBoard of apiBoards) {
          const board = mapApiBoard(apiBoard);
          const columns = mapApiColumns(apiBoard.columns || []);
          boards.push(board);
          newBoardColumns[board.id] = columns;
        }

        // Merge API boards into store WITHOUT triggering API side-effects
        useBoardStore.setState((state) => {
          const localBoards = state.boards.filter((b) => b.id === "board-default");
          const mergedBoards = [...boards, ...localBoards.filter((lb) => !boards.some((ab) => ab.id === lb.id))];
          const mergedColumns = { ...state.boardColumns, ...newBoardColumns };

          // Switch active board to first API board if currently on default
          const shouldSwitch = !state.activeBoard || state.activeBoard.id === "board-default";
          const activeBoard = shouldSwitch ? boards[0] : state.activeBoard;
          const columns = activeBoard ? (mergedColumns[activeBoard.id] || state.columns) : state.columns;

          return { boards: mergedBoards, boardColumns: mergedColumns, activeBoard, columns };
        });

        synced.current = true;
      } catch (err) {
        // Backend unavailable — continue with local data
        console.warn("Backend offline, using local data:", err);
      }
    }

    syncBoards();
  }, [isAuthenticated]);
}

// Utility: map frontend board/column/task to API format for write operations
export function toApiTask(task: Partial<Task>) {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assigneeId: task.assignee?.id,
    order: task.order,
    labels: task.labels?.map((l) => ({ name: l.name, color: l.color })),
  };
}
