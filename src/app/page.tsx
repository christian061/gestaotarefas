"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { useBoardStore } from "@/stores/board-store";
import { TaskDetailModal } from "@/components/kanban/task-detail-modal";
import { AddTaskModal } from "@/components/kanban/add-task-modal";
import { useBoardSync } from "@/hooks/use-board-sync";

export default function Home() {
  useBoardSync();
  const { selectedTask, setSelectedTask, isTaskModalOpen, setTaskModalOpen, activeBoard, columns } = useBoardStore();
  // Keep selectedTask in sync: derive live from columns so edits reflect immediately
  const liveTask = selectedTask ? columns.flatMap((c) => c.tasks).find((t) => t.id === selectedTask.id) ?? selectedTask : null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | undefined>();

  const handleAddTask = (columnId?: string) => {
    setAddTaskColumnId(columnId);
    setAddTaskOpen(true);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ paddingLeft: sidebarCollapsed ? 72 : 260 }}
        suppressHydrationWarning
      >
        <Header
          title={activeBoard?.title || "Quadros"}
          subtitle={activeBoard?.description || ""}
          onAddTask={handleAddTask}
        />

        <main className="flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
          <KanbanBoard onTaskClick={handleTaskClick} onAddTask={handleAddTask} />
        </main>
      </div>

      <MobileNav activeItem="/boards" />

      <AddTaskModal open={addTaskOpen} onOpenChange={setAddTaskOpen} defaultColumnId={addTaskColumnId} />

      {liveTask && (
        <TaskDetailModal
          task={liveTask}
          open={isTaskModalOpen}
          onOpenChange={setTaskModalOpen}
        />
      )}
    </div>
  );
}
