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
    },
  });
};

export const useCreateExchange = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { rate: number; date: Date }) =>
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
