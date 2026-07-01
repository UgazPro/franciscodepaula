import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";
import type { RepresentativeFormValues } from "@/services/users/representative.schema";

export const useCreateRepresentative = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: RepresentativeFormValues }) =>
      postDataApi("/users/representatives", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["representatives"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateRepresentative = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RepresentativeFormValues> }) =>
      putDataApi(`/users/representatives/${id}`, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["representatives"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
