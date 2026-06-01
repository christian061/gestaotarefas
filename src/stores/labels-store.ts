import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Label } from "@/types";

const DEFAULT_LABELS: Label[] = [
  { id: "l1", name: "Bug",      color: "#ef4444" },
  { id: "l2", name: "Feature",  color: "#8b5cf6" },
  { id: "l3", name: "Melhoria", color: "#3b82f6" },
  { id: "l4", name: "Urgente",  color: "#f97316" },
  { id: "l5", name: "Design",   color: "#ec4899" },
  { id: "l6", name: "Backend",  color: "#10b981" },
];

interface LabelsState {
  labels: Label[];
  addLabel: (label: Label) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
  reorderLabels: (labels: Label[]) => void;
}

export const useLabelsStore = create<LabelsState>()(
  persist(
    (set) => ({
      labels: DEFAULT_LABELS,

      addLabel: (label) =>
        set((s) => ({ labels: [...s.labels, label] })),

      updateLabel: (id, updates) =>
        set((s) => ({ labels: s.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)) })),

      deleteLabel: (id) =>
        set((s) => ({ labels: s.labels.filter((l) => l.id !== id) })),

      reorderLabels: (labels) => set({ labels }),
    }),
    { name: "taskflow-labels-v1" }
  )
);
