import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, patchDataApi } from "@/services/api";

export const useCreateSubject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { subject: string; code?: string }) =>
      postDataApi("/subjects", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

export const useUpdateSubject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { subject?: string; code?: string } }) =>
      putDataApi(`/subjects/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

export const useToggleSubjectStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      patchDataApi(`/subjects/${id}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};
