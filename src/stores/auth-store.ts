import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  clearError: () => void;
  loadFromCookies: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login(email, password);
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || "Erro ao fazer login" });
          throw err;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register(name, email, password);
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || "Erro ao registrar" });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
      },

      loginWithGoogle: async () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/google`;
      },

      loginWithGitHub: async () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/github`;
      },

      clearError: () => set({ error: null }),

      loadFromCookies: async () => {
        try {
          const me = await authApi.profile();
          set({
            user: me,
            isAuthenticated: true,
            // cookies passam a ser a fonte da verdade
            accessToken: null,
            refreshToken: null,
          });
        } catch {
          // silencioso: usuário não logado via cookies
        }
      },
    }),
    {
      name: "taskflow-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
