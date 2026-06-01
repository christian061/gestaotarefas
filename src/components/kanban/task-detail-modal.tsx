"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, AlertTriangle, Paperclip, MessageSquare, CheckCircle2, Send, User, Calendar, Tag, Trash2, Edit2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useBoardStore, mockUsers } from "@/stores/board-store";
import { useLabelsStore } from "@/stores/labels-store";
import { ManageLabelsModal } from "@/components/kanban/manage-labels-modal";
import type { Task, Priority, TaskStatus } from "@/types";

interface TaskDetailModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig: Record<Priority, { color: string; icon: React.ElementType; label: string }> = {
  urgent: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertTriangle, label: "Urgente" },
  high: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle, label: "Alta" },
  medium: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock, label: "Média" },
  low: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock, label: "Baixa" },
  none: { color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Clock, label: "Sem" },
};

export function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  const { updateTask, deleteTask, columns } = useBoardStore();
  const { labels } = useLabelsStore();
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState(task.description || "");
  const [manageLabels, setManageLabels] = useState(false);

  useEffect(() => {
    setEditedTitle(task.title);
    setEditedDesc(task.description || "");
    setIsEditing(false);
    setEditingDesc(false);
  }, [task.id]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: `c-${Date.now()}`,
      userId: "1",
      user: { id: "1", name: "Ana Silva", email: "ana@example.com" },
      content: newComment,
      createdAt: new Date().toISOString(),
    };
    updateTask(task.id, { comments: [...task.comments, comment] });
    setNewComment("");
  };

  const handleToggleChecklist = (checklistId: string) => {
    const updatedChecklist = task.checklist.map((c) =>
      c.id === checklistId ? { ...c, completed: !c.completed } : c
    );
    updateTask(task.id, { checklist: updatedChecklist });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteTask = () => {
    deleteTask(task.id, task.status);
    onOpenChange(false);
  };

  const handleSaveTitle = () => {
    updateTask(task.id, { title: editedTitle });
    setIsEditing(false);
  };

  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;
  const completedChecklist = task.checklist.filter((c) => c.completed).length;
  const totalChecklist = task.checklist.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Header */}
            <DialogHeader className="p-6 pb-4 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-lg font-semibold"
                      />
                      <Button size="sm" onClick={handleSaveTitle}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <DialogTitle className="text-lg font-semibold pr-8">{task.title}</DialogTitle>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={cn("text-xs h-6 px-2 gap-1.5", priority.color)}>
                      <PriorityIcon className="h-3 w-3" />
                      {priority.label}
                    </Badge>
                    {task.labels.map((label) => (
                      <Badge
                        key={label.id}
                        variant="outline"
                        className="text-xs h-6 px-2 border-0"
                        style={{ backgroundColor: `${label.color}20`, color: label.color }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDeleteTask} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="activity">Atividade</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-5 mt-4">
                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Descrição</Label>
                      {!editingDesc && (
                        <button onClick={() => setEditingDesc(true)} className="text-xs text-violet-500 hover:text-violet-600">
                          Editar
                        </button>
                      )}
                    </div>
                    {editingDesc ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedDesc}
                          onChange={(e) => setEditedDesc(e.target.value)}
                          className="min-h-[80px] resize-none text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => { updateTask(task.id, { description: editedDesc }); setEditingDesc(false); }}>
                            Salvar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditedDesc(task.description || ""); setEditingDesc(false); }}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted/80 transition-colors min-h-[48px]"
                        onClick={() => setEditingDesc(true)}
                      >
                        {task.description || <span className="italic">Clique para adicionar descrição...</span>}
                      </div>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" /> Responsável
                      </Label>
                      <Select
                        value={task.assignee?.id || "none"}
                        onValueChange={(v) => updateTask(task.id, { assignee: v === "none" ? undefined : mockUsers.find((u) => u.id === v) })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não atribuído</SelectItem>
                          {mockUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Prazo
                      </Label>
                      <Input
                        type="date"
                        className="h-9"
                        value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                        onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
                      />
                    </div>
                  </div>

                  {/* Labels */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Etiquetas
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
                        const active = task.labels.some((l) => l.id === label.id);
                        return (
                          <button
                            key={label.id}
                            onClick={() => {
                              const newLabels = active
                                ? task.labels.filter((l) => l.id !== label.id)
                                : [...task.labels, label];
                              updateTask(task.id, { labels: newLabels });
                            }}
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all",
                              active ? "opacity-100 scale-105" : "opacity-40 hover:opacity-70"
                            )}
                            style={{ backgroundColor: `${label.color}20`, borderColor: active ? label.color : "transparent", color: label.color }}
                          >
                            {label.name}
                          </button>
                        );
                      })}
                      {labels.length === 0 && (
                        <button className="text-xs text-muted-foreground hover:text-violet-500" onClick={() => setManageLabels(true)}>
                          + Criar etiquetas
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  {task.attachments.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Anexos ({task.attachments.length})
                      </Label>
                      <div className="space-y-2">
                        {task.attachments.map((attachment, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                            <Paperclip className="h-4 w-4" />
                            <span>{attachment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="checklist" className="space-y-4 mt-4">
                  {/* Checklist */}
                  {task.checklist.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Checklist ({completedChecklist}/{totalChecklist})
                        </Label>
                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {task.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => handleToggleChecklist(item.id)}
                            />
                            <span className={cn("text-sm", item.completed && "line-through text-muted-foreground")}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtasks */}
                  {task.subtasks.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Subtarefas ({completedSubtasks}/{totalSubtasks})
                        </Label>
                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                            <Checkbox
                              checked={subtask.completed}
                              onCheckedChange={() => handleToggleSubtask(subtask.id)}
                            />
                            <span
                              className={cn("text-sm", subtask.completed && "line-through text-muted-foreground")}
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4 mt-4">
                  {/* Comments */}
                  <div>
                    <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comentários ({task.comments.length})
                    </Label>
                    <div className="space-y-4">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-violet-400 to-indigo-500 text-white">
                              {comment.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="text-sm bg-muted/50 rounded-lg p-3">{comment.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-violet-400 to-indigo-500 text-white">
                        AS
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="md:w-64 border-t md:border-t-0 md:border-l border-border bg-muted/30 p-4 space-y-4 overflow-y-auto shrink-0">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Status</Label>
              <Select
                value={task.status}
                onValueChange={(value) => updateTask(task.id, { status: value as TaskStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Prioridade</Label>
              <Select
                value={task.priority}
                onValueChange={(value) => updateTask(task.id, { priority: value as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="none">Sem prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Criado em</Label>
              <div className="text-sm">
                {new Date(task.createdAt).toLocaleString("pt-BR")}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Atualizado em</Label>
              <div className="text-sm">
                {new Date(task.updatedAt).toLocaleString("pt-BR")}
              </div>
            </div>

            {task.timeSpent && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Tempo gasto</Label>
                <div className="text-sm">
                  {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      <ManageLabelsModal open={manageLabels} onClose={() => setManageLabels(false)} />
    </Dialog>
  );
}
