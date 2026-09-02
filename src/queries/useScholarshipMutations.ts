import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";
import type { CreateScholarshipDTO, UpdateScholarshipDTO } from "@/services/administration/scholarships.types";

export const useCreateScholarship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScholarshipDTO) => postDataApi("/scholarships", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["students-with-debts"] });
    },
  });
};

export const useUpdateScholarship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateScholarshipDTO }) =>
      putDataApi(`/scholarships/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["students-with-debts"] });
    },
  });
};

export const useDeleteScholarship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDataApi(`/scholarships/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["students-with-debts"] });
    },
  });
};
