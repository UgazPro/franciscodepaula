import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";

export const useCreateFee = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; schoolYearId: number; value: number; startAt: Date; endAt: Date }) =>
      postDataApi("/payments/fees", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
};

export const useUpdateFee = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; value?: number; startAt?: Date; endAt?: Date } }) =>
      putDataApi(`/payments/fees/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
};

export const useDeleteFee = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/payments/fees", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
};
