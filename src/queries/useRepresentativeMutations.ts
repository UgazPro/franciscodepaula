import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";

export const useCreateRepresentative = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      postDataApi("/users/representatives", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["representatives"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateRepresentative = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      putDataApi(`/users/representatives/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["representatives"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
