import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";
import type { PaymentFormValues } from "@/services/administration/payments.types";

export const useCreatePayment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: PaymentFormValues }) =>
      postDataApi("/payments", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-with-debts"] });
      qc.invalidateQueries({ queryKey: ["grade-teacher-planning"] });
      qc.invalidateQueries({ queryKey: ["teacher-planning"] });
      qc.invalidateQueries({ queryKey: ["teachers-overview"] });
      qc.invalidateQueries({ queryKey: ["grade-detail"] });
      qc.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useCreateExchange = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { rate: number; date: Date; setByUser?: boolean }) =>
      postDataApi("/payments/exchange", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchange-rate"] });
    },
  });
};

export const useUpdatePayment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PaymentFormValues> }) =>
      putDataApi(`/payments/${id}`, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-with-debts"] });
      qc.invalidateQueries({ queryKey: ["grade-teacher-planning"] });
      qc.invalidateQueries({ queryKey: ["teacher-planning"] });
      qc.invalidateQueries({ queryKey: ["teachers-overview"] });
      qc.invalidateQueries({ queryKey: ["grade-detail"] });
      qc.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useDeletePayment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/payments", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export interface PaymentMethodPayload {
  paymentTypeId: number;
  bank?: string;
  accountNumber?: string;
  identification?: string;
  email?: string;
  phone?: string;
  owner?: string;
  active?: boolean;
}

export const useCreatePaymentMethod = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentMethodPayload) =>
      postDataApi("/payments/payment-methods", data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentMethodPayload }) =>
      putDataApi(`/payments/payment-methods/${id}`, data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
};
