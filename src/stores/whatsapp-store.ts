import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

interface WhatsAppState {
  config: EvolutionConfig;
  connectedPhone: string;
  isConnected: boolean;
  notifSettings: Record<string, boolean>;

  saveConfig: (config: EvolutionConfig) => void;
  setConnected: (phone: string) => void;
  disconnect: () => void;
  setNotifSetting: (id: string, value: boolean) => void;
}

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set) => ({
      config: { apiUrl: "", apiKey: "", instanceName: "taskflow" },
      connectedPhone: "",
      isConnected: false,
      notifSettings: {
        task_created: true,
        task_completed: true,
        assignee_changed: false,
        due_date: true,
        overdue: true,
      },

      saveConfig: (config) => set({ config }),
      setConnected: (phone) => set({ isConnected: true, connectedPhone: phone }),
      disconnect: () => set({ isConnected: false, connectedPhone: "" }),
      setNotifSetting: (id, value) =>
        set((s) => ({ notifSettings: { ...s.notifSettings, [id]: value } })),
    }),
    { name: "taskflow-whatsapp-v1" }
  )
);
