import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";

const invalidateAssignments = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["teacher-assignments"] });
  qc.invalidateQueries({ queryKey: ["teacher-assignments-overview"] });
};

export const useCreateTeacherAssignment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { teacherId: number; levelSubjectId: number; sectionId: number }) =>
      postDataApi("/teacher-assignments", data),
    onSuccess: () => {
      invalidateAssignments(qc);
    },
  });
};

export const useUpdateTeacherAssignment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { teacherId?: number; levelSubjectId?: number; sectionId?: number } }) =>
      putDataApi(`/teacher-assignments/${id}`, data),
    onSuccess: () => {
      invalidateAssignments(qc);
    },
  });
};

export const useToggleTeacherAssignmentStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      putDataApi(`/teacher-assignments/${id}/toggle-status`),
    onSuccess: () => {
      invalidateAssignments(qc);
    },
  });
};
