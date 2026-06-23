import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";

export const useCreateEmployee = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      postDataApi("/users/staff", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      putDataApi(`/users/staff/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
