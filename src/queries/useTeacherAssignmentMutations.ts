import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, patchDataApi } from "@/services/api";

export const useCreateTeacherAssignment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { teacherId: number; subjectId: number; sectionId: number }) =>
      postDataApi("/teacher-assignments", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
};

export const useUpdateTeacherAssignment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { teacherId?: number; subjectId?: number; sectionId?: number } }) =>
      putDataApi(`/teacher-assignments/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
};

export const useToggleTeacherAssignmentStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      patchDataApi(`/teacher-assignments/${id}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
};
