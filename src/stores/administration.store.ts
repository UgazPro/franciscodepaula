import { create } from "zustand";
import type { AdminTab } from "@/services/administration/administration.types";

interface AdministrationStore {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
}

export const useAdministrationStore = create<AdministrationStore>((set) => ({
    activeTab: "dashboard",
    setActiveTab: (tab) => set({ activeTab: tab }),
}));
