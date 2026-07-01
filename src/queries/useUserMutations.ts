import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDataApi, postDataApi, putDataApi, putDataImageApi } from "@/services/api";
import type { StudentFormValues } from "@/services/users/student.schema";

export const useCreateStudent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: StudentFormValues }) =>
    postDataApi("/users/students", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-with-debts"] });
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<StudentFormValues> }) =>
    putDataApi(`/users/students/${id}`, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-with-debts"] });
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/users/students", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-with-debts"] });
    },
  });
};

export const useUpdateRepresentative = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RepresentativeFormValues> }) =>
      putDataApi(`/users/representatives/${id}`, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["representatives"] });
    },
  });
};
