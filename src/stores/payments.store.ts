import { create } from "zustand";
import type { PaymentResponse } from "@/services/administration/payments.types";

type PaymentScreen = "list" | "form";
type DateFilterMode = "range" | "exact";

export interface PaymentFilters {
  startDate: string | null;
  endDate: string | null;
  exactDate: string | null;
  dateMode: DateFilterMode;
  feeId: number | null;
  paymentMethodId: number | null;
  studentSearch: string;
  representativeSearch: string;
  morosos: boolean;
  studentId?: number;
  schoolYearId?: number;
}

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

  // Filters
  filters: PaymentFilters;
  setFilterStartDate: (v: string | null) => void;
  setFilterEndDate: (v: string | null) => void;
  setFilterExactDate: (v: string | null) => void;
  setFilterDateMode: (v: DateFilterMode) => void;
  setFilterFeeId: (v: number | null) => void;
  setFilterPaymentMethodId: (v: number | null) => void;
  setFilterStudentSearch: (v: string) => void;
  setFilterRepresentativeSearch: (v: string) => void;
  setFilterMorosos: (v: boolean) => void;
  clearPaymentFilters: () => void;
}

const defaultFilters: PaymentFilters = {
  startDate: null,
  endDate: null,
  exactDate: null,
  dateMode: "range",
  feeId: null,
  paymentMethodId: null,
  studentSearch: "",
  representativeSearch: "",
  morosos: false,
};

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

  // Filters
  filters: { ...defaultFilters },
  setFilterStartDate: (v) => set((s) => ({ filters: { ...s.filters, startDate: v } })),
  setFilterEndDate: (v) => set((s) => ({ filters: { ...s.filters, endDate: v } })),
  setFilterExactDate: (v) => set((s) => ({ filters: { ...s.filters, exactDate: v } })),
  setFilterDateMode: (v) => set((s) => ({ filters: { ...s.filters, dateMode: v } })),
  setFilterFeeId: (v) => set((s) => ({ filters: { ...s.filters, feeId: v } })),
  setFilterPaymentMethodId: (v) => set((s) => ({ filters: { ...s.filters, paymentMethodId: v } })),
  setFilterStudentSearch: (v) => set((s) => ({ filters: { ...s.filters, studentSearch: v } })),
  setFilterRepresentativeSearch: (v) => set((s) => ({ filters: { ...s.filters, representativeSearch: v } })),
  setFilterMorosos: (v) => set((s) => ({ filters: { ...s.filters, morosos: v } })),
  clearPaymentFilters: () => set({ filters: { ...defaultFilters } }),
}));
