import type { IStudent, ViewMode } from "@/services/users/user.interface";
import { create } from "zustand";

type StudentScreen = "list" | "detail" | "edit" | "form";

interface StudentsStore {

  mode: "create" | "edit";

  viewMode: ViewMode;
  setViewMode: (view: ViewMode) => void;

  screen: StudentScreen;
  setScreen: (screen: StudentScreen) => void;

  selectedStudent: IStudent | null;
  selectStudent: (student: IStudent) => void;
  clearSelectedStudent: () => void;

  startCreate: () => void;
  startEdit: (student: IStudent) => void;

  searchTerm: string;
  setSearchTerm: (v: string) => void;

  usingForm: boolean;
  openForm: () => void;
  closeForm: () => void;

  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
}

export const useStudentsStore = create<StudentsStore>((set) => ({

  mode: "create",
  
  viewMode: "list",
  setViewMode: (view) => set({ viewMode: view }),

  screen: "list",
  setScreen: (screen) => set({ screen }),

  selectedStudent: null,
  selectStudent: (student) => set({ selectedStudent: student, screen: "detail" }),
  clearSelectedStudent: () => set({ selectedStudent: null, screen: "list" }),

  startCreate: () => set({
    mode: "create",
    selectedStudent: null,
    screen: "form",
    step: 1,
  }),

  startEdit: (student) => set({
    mode: "edit",
    selectedStudent: student,
    screen: "form",
    step: 1,
  }),

  searchTerm: "",
  setSearchTerm: (v) => set({ searchTerm: v }),

  usingForm: false,
  openForm: () => set({ usingForm: true }),
  closeForm: () => set({ 
    screen: "list",
    step: 1,
    selectedStudent: null,
    mode: "create",
  }),

  step: 1,
  setStep: (step) => set({ step }),
  totalSteps: 4,

}));
