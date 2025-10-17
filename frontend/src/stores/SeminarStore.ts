import { create } from "zustand"
import type { MySeminar, Seminar } from "@/utils/types"

interface UserSeminarState {
  seminar: Seminar | null
  setSeminar: (seminar: Seminar) => void
  updateSeminar: (updates: Partial<Seminar>) => void
  clearSeminar: () => void
}

interface SeminarListState {
    seminar: Seminar[] | null
    setSeminar: (seminar : Seminar[]) => void
    updateSeminar: (updates: Partial<Seminar>) => void
    clearSeminar: () => void
}

 interface MySeminarListState {
  seminars: MySeminar[] | null
  setSeminar: (seminars: MySeminar[]) => void
  addSeminar: (seminar: MySeminar) => void
  removeSeminar: (id: number) => void
  clearSeminar: () => void
}

export const useUserSeminar = create<UserSeminarState>((set) => ({
  seminar: null,

  setSeminar: (seminar) => set({ seminar }),

  updateSeminar: (updates) =>
    set((state) => ({
      seminar: state.seminar ? { ...state.seminar, ...updates } : null,
    })),

  clearSeminar: () => set({ seminar: null }),
}))

export const useSeminarList = create<SeminarListState> ((set) => ({
    seminar: null,

    setSeminar: (seminar) => set({ seminar }),

    updateSeminar: (updates) =>
    set((state) => ({
      seminar: state.seminar ? { ...state.seminar, ...updates } : null,
    })),

  clearSeminar: () => set({ seminar: null }),
}))

export const useMySeminarList = create<MySeminarListState>((set) => ({
  seminars: null,

  setSeminar: (seminars) => set({ seminars }),

  addSeminar: (seminar) =>
    set((state) => ({
      seminars: state.seminars ? [...state.seminars, seminar] : [seminar],
    })),

  removeSeminar: (id) =>
    set((state) => ({
      seminars: state.seminars
        ? state.seminars.filter((s) => s.id !== id)
        : null,
    })),

  clearSeminar: () => set({ seminars: null }),
}))
