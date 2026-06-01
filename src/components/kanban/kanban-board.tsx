"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, X } from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { Column } from "./column";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Task } from "@/types";

const COLUMN_COLORS = ["#6366f1", "#f59e0b", "#a855f7", "#22c55e", "#ef4444", "#3b82f6", "#ec4899"];

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void;
  onAddTask?: (columnId?: string) => void;
}

export function KanbanBoard({ onTaskClick, onAddTask }: KanbanBoardProps) {
  const { columns, moveTask, reorderTask, addColumn, searchQuery, filterPriority, filterAssignee } = useBoardStore();

  const filteredColumns = columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((t) => {
      const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPriority = filterPriority === "all" || t.priority === filterPriority;
      const matchAssignee = filterAssignee === "all" || t.assignee?.id === filterAssignee;
      return matchSearch && matchPriority && matchAssignee;
    }),
  }));
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeColumn = columns.find((c) => c.tasks.some((t) => t.id === activeId));
    const overColumn = columns.find((c) => c.id === overId || c.tasks.some((t) => t.id === overId));
    if (!activeColumn || !overColumn) return;

    const activeIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
    if (activeColumn.id === overColumn.id) {
      const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
      if (overIndex !== -1 && overIndex !== activeIndex) reorderTask(activeColumn.id, activeIndex, overIndex);
    } else {
      const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
      moveTask(activeId, activeColumn.id, overColumn.id, overIndex === -1 ? overColumn.tasks.length : overIndex);
    }
  };

  const commitAddColumn = () => {
    const name = newColName.trim();
    if (!name) { setAddingColumn(false); return; }
    addColumn({
      id: `col-${Date.now()}`,
      title: name,
      color: COLUMN_COLORS[columns.length % COLUMN_COLORS.length],
      icon: "circle",
      tasks: [],
    });
    setNewColName("");
    setAddingColumn(false);
  };

  const NewColumnButton = (
    <div className="flex-shrink-0 w-72 px-4 pt-6 pb-4">
      {addingColumn ? (
        <div className="flex items-center gap-2 px-1">
          <Input
            autoFocus
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitAddColumn(); if (e.key === "Escape") setAddingColumn(false); }}
            placeholder="Nome da fase..."
            className="h-8 text-sm"
          />
          <button onClick={commitAddColumn} className="text-violet-500 hover:text-violet-600 shrink-0"><Check className="h-4 w-4" /></button>
          <button onClick={() => setAddingColumn(false)} className="text-muted-foreground hover:text-foreground shrink-0"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setAddingColumn(true)}
          className="w-full justify-start gap-2 h-10 text-muted-foreground border-2 border-dashed border-border hover:border-violet-500/40 hover:text-foreground rounded-xl"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Nova fase</span>
        </Button>
      )}
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex divide-x divide-border/70 pb-20 md:pb-0 overflow-x-auto h-full">
        {filteredColumns.map((column) => (
          <Column key={column.id} column={column} onTaskClick={onTaskClick} onAddTask={onAddTask} />
        ))}
        {NewColumnButton}
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex divide-x divide-border/70 pb-20 md:pb-0 overflow-x-auto h-full">
        <AnimatePresence>
          {filteredColumns.map((column) => (
            <Column key={column.id} column={column} onTaskClick={onTaskClick} onAddTask={onAddTask} />
          ))}
        </AnimatePresence>
        {NewColumnButton}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 shadow-xl opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
