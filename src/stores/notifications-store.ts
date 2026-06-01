import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
  bg: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

interface NotificationsState {
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    { name: "taskflow-notifications-v2" }
  )
);
