"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, AlertTriangle, CheckCircle2, Paperclip, MessageSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, Priority } from "@/types";
import { useBoardStore } from "@/stores/board-store";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityConfig: Record<Priority, { color: string; icon: React.ElementType; label: string }> = {
  urgent: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertTriangle, label: "Urgente" },
  high: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle, label: "Alta" },
  medium: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock, label: "Média" },
  low: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock, label: "Baixa" },
  none: { color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Clock, label: "Sem" },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { addTask, deleteTask } = useBoardStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const handleEdit = () => {
    // Defer until menu close animation finishes
    setTimeout(() => onClick(), 50);
  };

  const handleDuplicate = () => {
    addTask(task.status, {
      ...task,
      id: `${task.id}-copy-${Date.now()}`,
      title: `${task.title} (cópia)`,
      createdAt: new Date().toISOString(),
    });
  };

  const handleArchive = () => {
    deleteTask(task.id, task.status);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;

  const completedChecklist = task.checklist.filter((c) => c.completed).length;
  const totalChecklist = task.checklist.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const [now] = useState(() => new Date());
  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "done";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-card rounded-xl p-4 border border-border/50 shadow-sm cursor-pointer hover:shadow-md hover:border-border transition-all",
        isDragging && "opacity-50 rotate-2 shadow-xl"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {task.labels.map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="text-[10px] h-5 px-1.5 border-0"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </Badge>
          ))}
        </div>
        <div data-no-dnd>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center h-6 w-6 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>Duplicar</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleArchive}>Arquivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm mb-3 line-clamp-2 leading-relaxed">{task.title}</h3>

      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className={cn("text-[10px] h-5 px-2 gap-1.5", priority.color)}>
          <PriorityIcon className="h-2.5 w-2.5" />
          {priority.label}
        </Badge>
        {isOverdue && (
          <Badge variant="destructive" className="text-[10px] h-5 px-2 gap-1">
            <AlertTriangle className="h-2.5 w-2.5" />
            Atrasado
          </Badge>
        )}
      </div>

      {/* Checklist/Subtasks Progress */}
      {(totalChecklist > 0 || totalSubtasks > 0) && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>
              {completedChecklist + completedSubtasks}/{totalChecklist + totalSubtasks}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{
                width: `${((completedChecklist + completedSubtasks) / (totalChecklist + totalSubtasks)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-400 to-indigo-500 text-white">
                {task.assignee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          {task.dueDate && (
            <div className={cn("flex items-center gap-1 text-[10px]", isOverdue ? "text-red-500" : "text-muted-foreground")}>
              <Clock className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px]">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px]">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
