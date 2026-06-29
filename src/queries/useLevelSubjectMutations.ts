import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, deleteDataApi } from "@/services/api";

export const useAssignSubjectToLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ levelId, subjectId }: { levelId: number; subjectId: number }) =>
      postDataApi(`/subjects/levels/${levelId}`, { subjectId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["level-subjects"] });
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

export const useRemoveSubjectFromLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ levelId, subjectId }: { levelId: number; subjectId: number }) =>
      deleteDataApi(`/subjects/levels/${levelId}/subjects`, subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["level-subjects"] });
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};
