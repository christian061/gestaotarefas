import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Profile {
  name: string;
  email: string;
  role: string;
  phone: string;
}

interface NotificationPrefs {
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  weekly: boolean;
}

interface SettingsState {
  profile: Profile;
  notifPrefs: NotificationPrefs;
  theme: string;
  savedAt: string | null;

  updateProfile: (data: Partial<Profile>) => void;
  saveProfile: () => void;
  updateNotifPrefs: (data: Partial<NotificationPrefs>) => void;
  setTheme: (theme: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: {
        name: "",
        email: "",
        role: "",
        phone: "",
      },
      notifPrefs: {
        email: true,
        push: true,
        whatsapp: false,
        weekly: true,
      },
      theme: "dark",
      savedAt: null,

      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),

      saveProfile: () =>
        set({ savedAt: new Date().toISOString() }),

      updateNotifPrefs: (data) =>
        set((state) => ({ notifPrefs: { ...state.notifPrefs, ...data } })),

      setTheme: (theme) => set({ theme }),
    }),
    { name: "taskflow-settings-v2" }
  )
);
