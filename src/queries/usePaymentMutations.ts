import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";

export const useCreatePayment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      postDataApi("/payments", data),
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
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      putDataApi(`/payments/${id}`, data),
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
