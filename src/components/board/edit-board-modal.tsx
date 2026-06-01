"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Pencil } from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { cn } from "@/lib/utils";
import type { Board } from "@/types";

const COLOR_OPTIONS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-red-500 to-orange-600",
  "from-slate-500 to-gray-600",
  "from-teal-500 to-green-600",
];

interface EditBoardModalProps {
  board: Board;
  open: boolean;
  onClose: () => void;
}

export function EditBoardModal({ board, open, onClose }: EditBoardModalProps) {
  const { updateBoard } = useBoardStore();
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || "");
  const [color, setColor] = useState(board.color || COLOR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(board.title);
      setDescription(board.description || "");
      setColor(board.color || COLOR_OPTIONS[0]);
      setError("");
    }
  }, [open, board]);

  const handleSave = async () => {
    if (!title.trim()) { setError("O título é obrigatório."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    updateBoard(board.id, { title: title.trim(), description: description.trim(), color });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Pencil className="h-3.5 w-3.5 text-white" />
            </div>
            Editar Quadro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Preview */}
          <div className={cn("h-16 rounded-xl bg-gradient-to-br flex items-end p-3", color)}>
            <span className="text-white font-semibold text-sm drop-shadow">{title || "Nome do quadro"}</span>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              placeholder="Ex: Projeto Alpha"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Descrição</Label>
            <Textarea
              id="edit-desc"
              placeholder="Descreva o objetivo deste quadro..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none min-h-[72px]"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-lg bg-gradient-to-br transition-all ring-offset-background",
                    c,
                    color === c ? "ring-2 ring-violet-500 ring-offset-2 scale-110" : "hover:scale-105 opacity-70 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
