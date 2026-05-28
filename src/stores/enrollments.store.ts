import { create } from "zustand";

interface EnrollmentsStore {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedStudentId: number | null;
  selectStudent: (id: number) => void;
  clearSelected: () => void;
  showCompleteModal: boolean;
  openCompleteModal: () => void;
  closeCompleteModal: () => void;
}

export const useEnrollmentsStore = create<EnrollmentsStore>((set) => ({
  searchTerm: "",
  setSearchTerm: (v) => set({ searchTerm: v }),
  selectedStudentId: null,
  selectStudent: (id) => set({ selectedStudentId: id, showCompleteModal: true }),
  clearSelected: () => set({ selectedStudentId: null }),
  showCompleteModal: false,
  openCompleteModal: () => set({ showCompleteModal: true }),
  closeCompleteModal: () => set({ showCompleteModal: false, selectedStudentId: null }),
}));
