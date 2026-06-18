import type { IStudent, ViewMode } from "@/services/users/user.interface";
import { create } from "zustand";

type StudentScreen = "list" | "detail" | "edit" | "form";
type FilterView = "active" | "all" | "pending" | "inactive";

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

  filterView: FilterView;
  filterLevelId: number | null;
  filterSection: string | null;
  filterGender: string | null;
  filterAgeMode: "range" | "exact";
  filterAgeMin: number | null;
  filterAgeMax: number | null;
  filterAgeExact: number | null;

  setFilterView: (view: FilterView) => void;
  setFilterLevelId: (id: number | null) => void;
  setFilterSection: (section: string | null) => void;
  setFilterGender: (gender: string | null) => void;
  setFilterAgeMode: (mode: "range" | "exact") => void;
  setFilterAgeMin: (age: number | null) => void;
  setFilterAgeMax: (age: number | null) => void;
  setFilterAgeExact: (age: number | null) => void;
  clearFilters: () => void;
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

  filterView: "active",
  filterLevelId: null,
    filterSection: null,
  filterGender: null,
  filterAgeMode: "range",
  filterAgeMin: null,
  filterAgeMax: null,
  filterAgeExact: null,

  setFilterView: (view) => set({ filterView: view }),
  setFilterLevelId: (id) => set({ filterLevelId: id }),
  setFilterSection: (section) => set({ filterSection: section }),
  setFilterGender: (gender) => set({ filterGender: gender }),
  setFilterAgeMode: (mode) => set({ filterAgeMode: mode }),
  setFilterAgeMin: (age) => set({ filterAgeMin: age }),
  setFilterAgeMax: (age) => set({ filterAgeMax: age }),
  setFilterAgeExact: (age) => set({ filterAgeExact: age }),
  clearFilters: () => set({
    searchTerm: "",
    filterView: "active",
    filterLevelId: null,
  filterSection: null,
    filterGender: null,
    filterAgeMode: "range",
    filterAgeMin: null,
    filterAgeMax: null,
    filterAgeExact: null,
  }),

}));
