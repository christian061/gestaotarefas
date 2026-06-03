"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useBoardStore } from "@/stores/board-store";

let socket: Socket | null = null;
// In-flight moves to avoid echo/rollback: taskIds recently moved locally
const inFlightMoves = new Map<string, number>();

export function registerLocalMove(taskId: string, ttlMs = 1500) {
  const until = Date.now() + ttlMs;
  inFlightMoves.set(taskId, until);
  // cleanup later
  setTimeout(() => {
    const v = inFlightMoves.get(taskId);
    if (v && v <= Date.now()) inFlightMoves.delete(taskId);
  }, ttlMs + 50);
}

export function useBoardRealtime(boardId?: string) {
  const setState = useBoardStore.setState;
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!boardId || !/^c[0-9a-z]{24}$/i.test(boardId)) return;

    if (!socket) {
      const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(/\/api$/, "");
      socket = io(base, {
        path: "/ws",
        withCredentials: true,
        transports: ["websocket"],
      });
    }

    const s = socket!;

    const onConnect = () => {
      connectedRef.current = true;
      s.emit("join-board", boardId);
      setState((st: any) => ({ ...st, realtimeConnected: true }));
    };
    const onDisconnect = () => {
      connectedRef.current = false;
      setState((st: any) => ({ ...st, realtimeConnected: false }));
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    const onCreated = (task: any) => {
      setState((state: any) => {
        const cols = state.columns.map((c: any) => c.id === task.columnId ? { ...c, tasks: [...c.tasks, task] } : c);
        return { ...state, columns: cols };
      });
    };
    const onUpdated = (task: any) => {
      setState((state: any) => {
        const cols = state.columns.map((c: any) => ({ ...c, tasks: c.tasks.map((t: any) => t.id === task.id ? task : t) }));
        return { ...state, columns: cols };
      });
    };
    const onMoved = (data: { taskId: string; fromColumnId: string; toColumnId: string; order: number }) => {
      // Ignore echo for very recent local moves
      const until = inFlightMoves.get(data.taskId);
      if (until && until > Date.now()) return;
      setState((state: any) => {
        const from = state.columns.find((c: any) => c.id === data.fromColumnId);
        const to = state.columns.find((c: any) => c.id === data.toColumnId);
        if (!from || !to) return state;
        const task = from.tasks.find((t: any) => t.id === data.taskId);
        if (!task) return state;
        const fromTasks = from.tasks.filter((t: any) => t.id !== data.taskId);
        const toTasks = [...to.tasks];
        toTasks.splice(Math.min(data.order, toTasks.length), 0, { ...task, columnId: data.toColumnId });
        const cols = state.columns.map((c: any) =>
          c.id === from.id ? { ...c, tasks: fromTasks } : c.id === to.id ? { ...c, tasks: toTasks } : c
        );
        return { ...state, columns: cols };
      });
    };
    const onDeleted = ({ taskId }: { taskId: string }) => {
      setState((state: any) => {
        const cols = state.columns.map((c: any) => ({ ...c, tasks: c.tasks.filter((t: any) => t.id !== taskId) }));
        return { ...state, columns: cols };
      });
    };

    s.on("task:created", onCreated);
    s.on("task:updated", onUpdated);
    s.on("task:moved", onMoved);
    s.on("task:deleted", onDeleted);

    return () => {
      try { s.emit("leave-board", boardId); } catch {}
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("task:created", onCreated);
      s.off("task:updated", onUpdated);
      s.off("task:moved", onMoved);
      s.off("task:deleted", onDeleted);
    };
  }, [boardId]);
}
