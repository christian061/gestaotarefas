"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Tag, User, AlertCircle, Sparkles, Loader2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoardStore } from "@/stores/board-store";
import { useLabelsStore } from "@/stores/labels-store";
import { ManageLabelsModal } from "@/components/kanban/manage-labels-modal";
import type { Task, Priority, Label as LabelType } from "@/types";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultColumnId?: string;
}

export function AddTaskModal({ open, onOpenChange, defaultColumnId }: AddTaskModalProps) {
  const { addTask, columns, activeBoard } = useBoardStore();
  const { labels } = useLabelsStore();
  const firstColId = columns[0]?.id || "todo";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState<string>(defaultColumnId || firstColId);

  useEffect(() => {
    if (defaultColumnId) setColumnId(defaultColumnId);
    else if (firstColId) setColumnId(firstColId);
  }, [defaultColumnId, firstColId, open]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [assigneeId, setAssigneeId] = useState<string>("none");
  const [dueDate, setDueDate] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<LabelType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manageLabels, setManageLabels] = useState(false);

  const toggleLabel = (label: LabelType) => {
    setSelectedLabels((prev) =>
      prev.find((l) => l.id === label.id)
        ? prev.filter((l) => l.id !== label.id)
        : [...prev, label]
    );
  };

  const handleAIGenerate = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((r) => setTimeout(r, 1200));
    setDescription(
      `Implementar ${title.toLowerCase()} seguindo as melhores práticas de desenvolvimento. Garantir cobertura de testes unitários e documentação atualizada.`
    );
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = activeBoard?.members?.find((u: any) => u.id === assigneeId);

    const col = columns.find((c) => c.id === columnId);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      status: col?.id as any || "todo",
      priority,
      assignee: assignee || undefined,
      labels: selectedLabels,
      checklist: [],
      subtasks: [],
      comments: [],
      attachments: [],
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 999,
    };

    addTask(columnId, newTask);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setColumnId(defaultColumnId || firstColId);
    setPriority("medium");
    setAssigneeId("none");
    setDueDate("");
    setSelectedLabels([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Implementar autenticação JWT..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10"
              required
              autoFocus
            />
          </div>

          {/* Description + AI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Descrição</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-violet-500 hover:text-violet-600 hover:bg-violet-500/10"
                onClick={handleAIGenerate}
                disabled={!title.trim() || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Gerar com IA
              </Button>
            </div>
            <Textarea
              id="description"
              placeholder="Descreva a tarefa em detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={columnId} onValueChange={(v) => v && setColumnId(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: col.color }} />
                        {col.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="low">🔵 Baixa</SelectItem>
                  <SelectItem value="none">⚪ Sem prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Responsável
              </Label>
              <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(activeBoard?.members || []).map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Prazo
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Etiquetas
              </Label>
              <Button
                type="button" variant="ghost" size="sm"
                className="h-6 gap-1 text-xs text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10"
                onClick={() => setManageLabels(true)}
              >
                <Settings2 className="h-3 w-3" /> Gerenciar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const selected = selectedLabels.find((l) => l.id === label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all border",
                      selected ? "opacity-100 scale-105" : "opacity-50 hover:opacity-80"
                    )}
                    style={{
                      backgroundColor: `${label.color}20`,
                      borderColor: selected ? label.color : "transparent",
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </button>
                );
              })}
              {labels.length === 0 && (
                <button type="button" className="text-xs text-muted-foreground hover:text-violet-500" onClick={() => setManageLabels(true)}>
                  + Criar primeira etiqueta
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20"
            >
              Criar Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
      <ManageLabelsModal open={manageLabels} onClose={() => setManageLabels(false)} />
    </Dialog>
  );
}
