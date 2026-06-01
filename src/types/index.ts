export type Priority = "urgent" | "high" | "medium" | "low" | "none";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: User;
  labels: Label[];
  checklist: ChecklistItem[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  timeSpent?: number;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  icon: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  color?: string;
  template?: string;
  columns: Column[];
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  completionRate: number;
  avgCompletionTime: number;
}
