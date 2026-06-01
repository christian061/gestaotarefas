"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KanbanSquare, Loader2 } from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { id: "blank", label: "Em branco", description: "Comece do zero" },
  { id: "agile", label: "Agile Sprint", description: "Backlog, Em andamento, Revisão, Concluído" },
  { id: "kanban", label: "Kanban Básico", description: "A Fazer, Em andamento, Concluído" },
];

const COLOR_OPTIONS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-red-500 to-orange-600",
];

interface NewBoardModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewBoardModal({ open, onClose }: NewBoardModalProps) {
  const router = useRouter();
  const { addBoard, switchBoard } = useBoardStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("kanban");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setTemplate("kanban");
    setColor(COLOR_OPTIONS[0]);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) { setError("O nome do quadro é obrigatório."); return; }
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const boardId = `board-${Date.now()}`;
    addBoard({
      id: boardId,
      title: title.trim(),
      description: description.trim(),
      color,
      template,
      columns: [],
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    switchBoard(boardId);

    setLoading(false);
    handleClose();
    router.push("/");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KanbanSquare className="h-5 w-5 text-violet-500" />
            Novo Quadro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Color picker */}
          <div className="space-y-2">
            <Label>Cor do quadro</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    `h-8 w-8 rounded-lg bg-gradient-to-br ${c} transition-all`,
                    color === c ? "ring-2 ring-offset-2 ring-violet-500 scale-110" : "hover:scale-105"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Nome do quadro <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Ex: Projeto Website, Sprint 3..."
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Textarea
              placeholder="Descreva o objetivo deste quadro..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all text-xs",
                    template === t.id
                      ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "border-border hover:border-violet-500/40 text-muted-foreground"
                  )}
                >
                  <p className="font-medium">{t.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70 leading-tight">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={cn(
            "h-16 rounded-xl bg-gradient-to-br flex items-center justify-center",
            color
          )}>
            <span className="text-white font-semibold text-sm drop-shadow">
              {title || "Meu Quadro"}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !title.trim()}
            className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KanbanSquare className="h-4 w-4" />}
            Criar Quadro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
