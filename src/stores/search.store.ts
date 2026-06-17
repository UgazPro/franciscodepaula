import { create } from "zustand";

export interface SearchResult {
  id: number;
  type: "student" | "employee" | "representative";
  person: {
    id: number;
    firstNames: string;
    lastNames: string;
    identificationNumber: string;
    profilePhoto: string | null;
  };
  role?: string;
}

interface SearchStore {
  query: string;
  results: SearchResult[];
  selectedPerson: SearchResult | null;
  isDetailOpen: boolean;
  isSearching: boolean;
  setQuery: (q: string) => void;
  setResults: (r: SearchResult[]) => void;
  selectPerson: (p: SearchResult) => void;
  closeDetail: () => void;
  clearSearch: () => void;
  setIsSearching: (v: boolean) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: [],
  selectedPerson: null,
  isDetailOpen: false,
  isSearching: false,
  setQuery: (q) => set({ query: q }),
  setResults: (r) => set({ results: r }),
  selectPerson: (p) => set({ selectedPerson: p, isDetailOpen: true, query: "", results: [] }),
  closeDetail: () => set({ selectedPerson: null, isDetailOpen: false }),
  clearSearch: () => set({ query: "", results: [], selectedPerson: null, isDetailOpen: false }),
  setIsSearching: (v) => set({ isSearching: v }),
}));
