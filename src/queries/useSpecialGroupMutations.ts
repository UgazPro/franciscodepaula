import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";

const invalidateSpecialGroups = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["special-groups"] });
  qc.invalidateQueries({ queryKey: ["special-group-students"] });
  qc.invalidateQueries({ queryKey: ["available-students-crp"] });
  qc.invalidateQueries({ queryKey: ["teacher-assignments"] });
  qc.invalidateQueries({ queryKey: ["teacher-assignments-overview"] });
};

export const useCreateSpecialGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { teacherId: number; levelSubjectId: number; schoolYearId: number; groupName: string }) =>
      postDataApi("/teacher-assignments/special-groups", data),
    onSuccess: () => {
      invalidateSpecialGroups(qc);
    },
  });
};

export const useUpdateSpecialGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { teacherId?: number; levelSubjectId?: number; schoolYearId?: number; groupName?: string } }) =>
      putDataApi(`/teacher-assignments/special-groups/${id}`, data),
    onSuccess: () => {
      invalidateSpecialGroups(qc);
    },
  });
};

export const useToggleSpecialGroupStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      putDataApi(`/teacher-assignments/special-groups/${id}/toggle-status`),
    onSuccess: () => {
      invalidateSpecialGroups(qc);
    },
  });
};

export const useAddStudentsToSpecialGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ groupName, studentEnrollmentIds }: { groupName: string; studentEnrollmentIds: number[] }) =>
      postDataApi(`/teacher-assignments/special-groups/${groupName}/students`, { studentEnrollmentIds }),
    onSuccess: () => {
      invalidateSpecialGroups(qc);
    },
  });
};

export const useRemoveStudentFromSpecialGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ groupName, studentEnrollmentId }: { groupName: string; studentEnrollmentId: number }) =>
      deleteDataApi(`/teacher-assignments/special-groups/${groupName}/students`, studentEnrollmentId),
    onSuccess: () => {
      invalidateSpecialGroups(qc);
    },
  });
};
