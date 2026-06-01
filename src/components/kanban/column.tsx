"use client";

import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskCard } from "./task-card";
import { useBoardStore } from "@/stores/board-store";
import type { Column, Task } from "@/types";

interface ColumnProps {
  column: Column;
  onTaskClick: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
}

export function Column({ column, onTaskClick, onAddTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const { renameColumn, deleteColumn, clearColumnTasks } = useBoardStore();
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== column.title) renameColumn(column.id, trimmed);
    else setRenameValue(column.title);
    setRenaming(false);
  };

  const totalTasks = column.tasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 w-80 flex flex-col h-full"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
          {renaming ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setRenameValue(column.title); setRenaming(false); } }}
                className="h-6 text-sm font-semibold px-1 py-0"
              />
              <button onClick={commitRename} className="shrink-0 text-violet-500 hover:text-violet-600">
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <h2
                className="font-semibold text-sm truncate cursor-pointer hover:text-violet-500 transition-colors"
                onDoubleClick={() => setRenaming(true)}
              >
                {column.title}
              </h2>
              <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">{totalTasks}</Badge>
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-accent transition-colors shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddTask?.(column.id)}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar tarefa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setRenameValue(column.title); setRenaming(true); }}>
              <Check className="h-4 w-4 mr-2" /> Renomear fase
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => clearColumnTasks(column.id)} className="text-orange-500">
              <Trash2 className="h-4 w-4 mr-2" /> Arquivar tarefas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteColumn(column.id)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Excluir fase
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl border-2 border-dashed p-2 space-y-2 transition-all min-h-[200px]",
          isOver ? "border-violet-500/50 bg-violet-500/5" : "border-transparent"
        )}
      >
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <Button
        variant="ghost"
        onClick={() => onAddTask?.(column.id)}
        className="w-full mt-2 justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">Adicionar tarefa</span>
      </Button>
    </motion.div>
  );
}
