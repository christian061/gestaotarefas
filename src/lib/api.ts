const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("taskflow-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ access_token: string; refresh_token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<{ access_token: string; refresh_token: string; user: any }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  profile: () => request<any>("/auth/profile"),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: 'POST' }),
};

// ── Boards ──────────────────────────────────────────────────────────────────

export const boardsApi = {
  list: () => request<any[]>("/boards"),

  get: (boardId: string) => request<any>(`/boards/${boardId}`),

  create: (data: { title: string; description?: string; template?: string }) =>
    request<any>("/boards", { method: "POST", body: JSON.stringify(data) }),

  update: (boardId: string, data: Partial<{ title: string; description: string }>) =>
    request<any>(`/boards/${boardId}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (boardId: string) =>
    request<void>(`/boards/${boardId}`, { method: "DELETE" }),

  addMember: (boardId: string, email: string) =>
    request<any>(`/boards/${boardId}/members`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  removeMember: (boardId: string, userId: string) =>
    request<{ removed: boolean }>(`/boards/${boardId}/members/${userId}`, {
      method: 'DELETE',
    }),

  // Columns
  addColumn: (boardId: string, data: { title: string; color: string; icon: string }) =>
    request<any>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateColumn: (boardId: string, columnId: string, data: { title?: string; color?: string; order?: number }) =>
    request<any>(`/boards/${boardId}/columns/${columnId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteColumn: (boardId: string, columnId: string) =>
    request<void>(`/boards/${boardId}/columns/${columnId}`, { method: "DELETE" }),
};

// ── Tasks ───────────────────────────────────────────────────────────────────

export const tasksApi = {
  create: (columnId: string, data: any) =>
    request<any>(`/tasks/column/${columnId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (taskId: string, data: any) =>
    request<any>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  move: (taskId: string, columnId: string, order: number) =>
    request<any>(`/tasks/${taskId}/move`, {
      method: "PATCH",
      body: JSON.stringify({ columnId, order }),
    }),

  delete: async (taskId: string) => {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, { method: "DELETE", credentials: 'include', headers });
    if (res.status === 404) {
      return; // item não existe na API — trate como sucesso para limpar local
    }
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return;
  },

  addComment: (taskId: string, content: string) =>
    request<any>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  toggleChecklist: (checklistId: string) =>
    request<any>(`/tasks/checklist/${checklistId}/toggle`, { method: "PATCH" }),
};

// ── Invites ─────────────────────────────────────────────────────────────────

export const invitesApi = {
  sendEmail: (data: { to: string; boardName: string; inviteLink: string; inviterName?: string }) =>
    request<{ success: boolean; id?: string }>("/invites/send-email", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
