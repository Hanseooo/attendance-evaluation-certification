import { create } from "zustand";

type EmailNotificationState = {
  enabled: boolean;
  hydrated: boolean;
  setEnabled: (enabled: boolean) => void;
  setHydrated: (v: boolean) => void;
};

export const useEmailNotificationStore = create<EmailNotificationState>(
  (set) => ({
    enabled: false, // default OFF
    hydrated: false, // prevents UI flicker
    setEnabled: (enabled) => set({ enabled }),
    setHydrated: (v) => set({ hydrated: v }),
  })
);
