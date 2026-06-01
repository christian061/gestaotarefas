import { create } from "zustand";
import { persist } from "zustand/middleware";
import { boardsApi, tasksApi } from "@/lib/api";
import type { Task, Column, Board, TaskStatus, Priority, User, Label } from "@/types";

// IDs locais (não sincronizados com a API)
const LOCAL_BOARD_IDS = new Set(["board-default"]);
const LOCAL_COL_IDS = new Set(["todo", "in_progress", "review", "done"]);
const isApiId = (id: string) => !LOCAL_BOARD_IDS.has(id) && !LOCAL_COL_IDS.has(id) && !id.startsWith("col-local-");

function apiTask(task: Partial<Task>) {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assigneeId: (task.assignee as any)?.id,
    order: task.order,
    labels: task.labels?.map((l) => ({ name: l.name, color: l.color })),
  };
}

const mockUsers: User[] = [];


function createEmptyColumns(template: string): Column[] {
  if (template === "agile") {
    return [
      { id: "todo", title: "Backlog", color: "#6366f1", icon: "circle", tasks: [] },
      { id: "in_progress", title: "Em Andamento", color: "#f59e0b", icon: "clock", tasks: [] },
      { id: "review", title: "Revisão", color: "#a855f7", icon: "eye", tasks: [] },
      { id: "done", title: "Concluído", color: "#22c55e", icon: "check", tasks: [] },
    ];
  }
  if (template === "kanban") {
    return [
      { id: "todo", title: "A Fazer", color: "#6366f1", icon: "circle", tasks: [] },
      { id: "in_progress", title: "Em Andamento", color: "#f59e0b", icon: "clock", tasks: [] },
      { id: "review", title: "Em Revisão", color: "#a855f7", icon: "eye", tasks: [] },
      { id: "done", title: "Concluído", color: "#22c55e", icon: "check", tasks: [] },
    ];
  }
  return [
    { id: "todo", title: "A Fazer", color: "#6366f1", icon: "circle", tasks: [] },
    { id: "in_progress", title: "Em Andamento", color: "#f59e0b", icon: "clock", tasks: [] },
    { id: "review", title: "Em Revisão", color: "#a855f7", icon: "eye", tasks: [] },
    { id: "done", title: "Concluído", color: "#22c55e", icon: "check", tasks: [] },
  ];
}

const DEFAULT_BOARD_ID = "board-default";

const defaultBoard: Board = {
  id: DEFAULT_BOARD_ID,
  title: "Meu Primeiro Quadro",
  description: "",
  color: "from-violet-500 to-indigo-600",
  template: "kanban",
  columns: [],
  members: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface BoardState {
  boards: Board[];
  boardColumns: Record<string, Column[]>;
  activeBoard: Board | null;
  columns: Column[];
  searchQuery: string;
  filterPriority: Priority | "all";
  filterAssignee: string | "all";
  selectedTask: Task | null;
  isTaskModalOpen: boolean;

  setColumns: (columns: Column[]) => void;
  moveTask: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  addTask: (columnId: string, task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: Priority | "all") => void;
  setFilterAssignee: (assignee: string | "all") => void;
  setSelectedTask: (task: Task | null) => void;
  setTaskModalOpen: (open: boolean) => void;
  reorderTask: (columnId: string, oldIndex: number, newIndex: number) => void;
  addBoard: (board: Board) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  setActiveBoard: (board: Board) => void;
  switchBoard: (boardId: string) => void;
  deleteBoard: (boardId: string) => void;
  addColumn: (column: Column) => void;
  renameColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  clearColumnTasks: (columnId: string) => void;
}

const initialMockColumns = createEmptyColumns("kanban");

export const useBoardStore = create<BoardState>()(persist((set, get) => ({
  boards: [defaultBoard],
  boardColumns: { [DEFAULT_BOARD_ID]: initialMockColumns },
  activeBoard: defaultBoard,
  columns: initialMockColumns,
  searchQuery: "",
  filterPriority: "all",
  filterAssignee: "all",
  selectedTask: null,
  isTaskModalOpen: false,

  setColumns: (columns) => {
    const { activeBoard, boardColumns } = get();
    if (activeBoard) {
      set({ columns, boardColumns: { ...boardColumns, [activeBoard.id]: columns } });
    } else {
      set({ columns });
    }
  },

  addBoard: (board) => {
    const newColumns = createEmptyColumns(board.template || "kanban");
    set((state) => ({
      boards: [...state.boards, board],
      boardColumns: { ...state.boardColumns, [board.id]: newColumns },
    }));
    // API: create board and replace temp ID with real ID
    boardsApi.create({ title: board.title, description: board.description, template: board.template })
      .then((apiBoard) => {
        set((state) => {
          const cols = (state.boardColumns[board.id] || []).map((c) => ({ ...c }));
          const boards = state.boards.map((b) => b.id === board.id ? { ...b, id: apiBoard.id } : b);
          const newBoardColumns = { ...state.boardColumns };
          delete newBoardColumns[board.id];
          newBoardColumns[apiBoard.id] = cols;
          const active = state.activeBoard?.id === board.id ? { ...state.activeBoard, id: apiBoard.id } : state.activeBoard;
          return { boards, boardColumns: newBoardColumns, activeBoard: active, columns: active?.id === apiBoard.id ? cols : state.columns };
        });
      })
      .catch(console.warn);
  },

  setActiveBoard: (board) => {
    const cols = get().boardColumns[board.id] || createEmptyColumns(board.template || "kanban");
    set({ activeBoard: board, columns: cols });
  },

  switchBoard: (boardId) => {
    const { boards, boardColumns } = get();
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;
    const cols = boardColumns[boardId] || createEmptyColumns(board.template || "kanban");
    set({ activeBoard: board, columns: cols, selectedTask: null, isTaskModalOpen: false });
  },

  updateBoard: (boardId, updates) => {
    set((state) => {
      const boards = state.boards.map((b) => b.id === boardId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b);
      const activeBoard = state.activeBoard?.id === boardId ? { ...state.activeBoard, ...updates, updatedAt: new Date().toISOString() } : state.activeBoard;
      return { boards, activeBoard };
    });
    if (isApiId(boardId)) boardsApi.update(boardId, updates).catch(console.warn);
  },

  deleteBoard: (boardId) => {
    const { boards, boardColumns, activeBoard } = get();
    const remaining = boards.filter((b) => b.id !== boardId);
    const newBoardColumns = { ...boardColumns };
    delete newBoardColumns[boardId];
    const newActive = activeBoard?.id === boardId ? (remaining[0] || null) : activeBoard;
    const newCols = newActive ? (newBoardColumns[newActive.id] || []) : [];
    set({ boards: remaining, boardColumns: newBoardColumns, activeBoard: newActive, columns: newCols });
    if (isApiId(boardId)) boardsApi.delete(boardId).catch(console.warn);
  },

  addColumn: (column) => {
    set((state) => {
      const newColumns = [...state.columns, column];
      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
    });
    const bid = get().activeBoard?.id;
    if (bid && isApiId(bid)) {
      boardsApi.addColumn(bid, { title: column.title, color: column.color, icon: column.icon })
        .then((apiCol) => {
          // Replace temp column ID with real API ID
          set((state) => {
            const newColumns = state.columns.map((c) => c.id === column.id ? { ...c, id: apiCol.id } : c);
            return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
          });
        })
        .catch(console.warn);
    }
  },

  renameColumn: (columnId, title) => {
    set((state) => {
      const newColumns = state.columns.map((c) => c.id === columnId ? { ...c, title } : c);
      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
    });
    const bid = get().activeBoard?.id;
    if (bid && isApiId(bid) && isApiId(columnId)) boardsApi.updateColumn(bid, columnId, { title }).catch(console.warn);
  },

  deleteColumn: (columnId) => {
    set((state) => {
      const newColumns = state.columns.filter((c) => c.id !== columnId);
      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
    });
    const bid = get().activeBoard?.id;
    if (bid && isApiId(bid) && isApiId(columnId)) boardsApi.deleteColumn(bid, columnId).catch(console.warn);
  },

  clearColumnTasks: (columnId) => {
    set((state) => {
      const newColumns = state.columns.map((c) => c.id === columnId ? { ...c, tasks: [] } : c);
      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
    });
  },

  moveTask: (taskId, fromColumn, toColumn, newIndex) => {
    set((state) => {
      const newColumns = state.columns.map((col) => ({ ...col, tasks: [...col.tasks] }));
      const fromCol = newColumns.find((c) => c.id === fromColumn);
      const toCol = newColumns.find((c) => c.id === toColumn);
      if (!fromCol || !toCol) return state;

      const taskIndex = fromCol.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return state;

      const [task] = fromCol.tasks.splice(taskIndex, 1);
      task.status = toColumn as any;
      task.updatedAt = new Date().toISOString();
      toCol.tasks.splice(newIndex, 0, task);

      toCol.tasks.forEach((t, i) => (t.order = i));

      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
    });
    if (isApiId(taskId) && isApiId(toColumn)) tasksApi.move(taskId, toColumn, newIndex).catch(console.warn);
  },

  addTask: (columnId, task) => {
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      });
      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
    });
    if (isApiId(columnId)) {
      tasksApi.create(columnId, apiTask(task))
        .then((apiTask_) => {
          // Replace temp task ID with real API ID
          set((state) => {
            const newColumns = state.columns.map((col) => ({
              ...col,
              tasks: col.tasks.map((t) => t.id === task.id ? { ...t, id: apiTask_.id } : t),
            }));
            const bid = state.activeBoard?.id;
            return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
          });
        })
        .catch(console.warn);
    }
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const newColumns = state.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      }));
      const updatedTask = newColumns
        .flatMap((c) => c.tasks)
        .find((t) => t.id === taskId);
      const bid = state.activeBoard?.id;
      return {
        columns: newColumns,
        boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns,
        selectedTask: state.selectedTask?.id === taskId ? updatedTask || null : state.selectedTask,
      };
    });
    if (isApiId(taskId)) tasksApi.update(taskId, apiTask(updates as Partial<Task>)).catch(console.warn);
  },

  deleteTask: (taskId, columnId) => {
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }
        return col;
      });
      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns, selectedTask: null, isTaskModalOpen: false };
    });
    if (isApiId(taskId)) tasksApi.delete(taskId).catch(console.warn);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setTaskModalOpen: (open) => set({ isTaskModalOpen: open }),

  reorderTask: (columnId, oldIndex, newIndex) => {
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          const newTasks = [...col.tasks];
          const [moved] = newTasks.splice(oldIndex, 1);
          newTasks.splice(newIndex, 0, moved);
          newTasks.forEach((t, i) => (t.order = i));
          return { ...col, tasks: newTasks };
        }
        return col;
      });
      const bid = state.activeBoard?.id;
      return { columns: newColumns, boardColumns: bid ? { ...state.boardColumns, [bid]: newColumns } : state.boardColumns };
    });
  },
}), {
  name: "taskflow-board-v1",
  partialize: (state) => ({
    boards: state.boards,
    boardColumns: state.boardColumns,
    activeBoard: state.activeBoard,
  }),
  onRehydrateStorage: () => (state) => {
    if (state?.activeBoard) {
      const cols = state.boardColumns[state.activeBoard.id] || [];
      state.columns = cols;
    }
  },
}));

export { mockUsers };
