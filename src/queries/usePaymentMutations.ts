import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, deleteDataApi } from "@/services/api";

export const useCreatePayment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      postDataApi("/payments", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
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
