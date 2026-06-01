"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { useLabelsStore } from "@/stores/labels-store";
import { cn } from "@/lib/utils";
import type { Label as LabelType } from "@/types";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
  "#64748b", "#6b7280", "#1e293b", "#0f172a",
];

interface ManageLabelsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ManageLabelsModal({ open, onClose }: ManageLabelsModalProps) {
  const { labels, addLabel, updateLabel, deleteLabel } = useLabelsStore();

  /* ── New label form ── */
  const [newName, setNewName]   = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[10]);
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    addLabel({ id: `l-${Date.now()}`, name: newName.trim(), color: newColor });
    setNewName("");
    setNewColor(PRESET_COLORS[10]);
    setCreating(false);
  };

  /* ── Editing state ── */
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editName, setEditName]       = useState("");
  const [editColor, setEditColor]     = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const startEdit = (label: LabelType) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
  };

  const commitEdit = () => {
    if (!editName.trim() || !editingId) return;
    updateLabel(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Tag className="h-3.5 w-3.5 text-white" />
            </div>
            Gerenciar Etiquetas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto py-1 pr-1">
          <AnimatePresence initial={false}>
            {labels.map((label) => (
              <motion.div
                key={label.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group"
              >
                {editingId === label.id ? (
                  /* ── Edit row ── */
                  <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 space-y-3">
                    <div className="flex gap-2">
                      <div
                        className="h-9 w-9 rounded-lg shrink-0 border-2 border-white/20 shadow"
                        style={{ backgroundColor: editColor }}
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit(); }}
                        className="flex-1 h-9"
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-10 gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={cn(
                            "h-6 w-6 rounded-md transition-all ring-offset-background",
                            editColor === c ? "ring-2 ring-offset-1 ring-violet-500 scale-110" : "hover:scale-110 opacity-80 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                      </Button>
                      <Button
                        type="button" size="sm"
                        disabled={!editName.trim()}
                        onClick={commitEdit}
                        className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Salvar
                      </Button>
                    </div>
                  </div>
                ) : confirmDelete === label.id ? (
                  /* ── Delete confirm ── */
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 flex items-center justify-between gap-3">
                    <p className="text-sm">Excluir <strong>{label.name}</strong>?</p>
                    <div className="flex gap-2 shrink-0">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>Não</Button>
                      <Button
                        type="button" size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => { deleteLabel(label.id); setConfirmDelete(null); }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal row ── */
                  <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <span
                      className="h-5 w-5 rounded-md shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span
                      className="flex-1 text-sm font-medium px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: `${label.color}20`, color: label.color }}
                    >
                      {label.name}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button" variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(label)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button" variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => setConfirmDelete(label.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── New label form ── */}
          <AnimatePresence>
            {creating ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-3 space-y-3"
              >
                <Label className="text-xs font-semibold text-violet-600 dark:text-violet-400">Nova etiqueta</Label>
                <div className="flex gap-2">
                  <div
                    className="h-9 w-9 rounded-lg shrink-0 border-2 border-white/20 shadow"
                    style={{ backgroundColor: newColor }}
                  />
                  <Input
                    placeholder="Nome da etiqueta..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                    className="flex-1 h-9"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={cn(
                        "h-6 w-6 rounded-md transition-all ring-offset-background",
                        newColor === c ? "ring-2 ring-offset-1 ring-violet-500 scale-110" : "hover:scale-110 opacity-80 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                  <Button
                    type="button" size="sm"
                    disabled={!newName.trim()}
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Criar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-dashed hover:border-violet-500/50 hover:text-violet-500"
                  onClick={() => setCreating(true)}
                >
                  <Plus className="h-4 w-4" /> Nova etiqueta
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
