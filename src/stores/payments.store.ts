import { create } from "zustand";
import type { PaymentResponse } from "@/services/administration/payments.types";

type PaymentScreen = "list" | "form";

interface PaymentsStore {
  screen: PaymentScreen;
  setScreen: (screen: PaymentScreen) => void;
  selectedPayment: PaymentResponse | null;
  selectPayment: (payment: PaymentResponse) => void;
  clearSelected: () => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
}

export const usePaymentsStore = create<PaymentsStore>((set) => ({
  screen: "list",
  setScreen: (screen) => set({ screen }),
  selectedPayment: null,
  selectPayment: (payment) => set({ selectedPayment: payment }),
  clearSelected: () => set({ selectedPayment: null }),
  searchTerm: "",
  setSearchTerm: (v) => set({ searchTerm: v }),
  step: 1,
  setStep: (step) => set({ step }),
  totalSteps: 2,
}));
