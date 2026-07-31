import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi } from "@/services/api";

export interface CreateAttemptData {
  score?: number;
  evaluationDate?: string;
  observations?: string;
  createdBy?: number;
}

export const useAddFailedSubjectAttempt = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ failedSubjectId, data }: { failedSubjectId: number; data: CreateAttemptData }) =>
      postDataApi(`/academic-history/failed-subject/${failedSubjectId}/attempts`, data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["failed-subjects"] });
      qc.invalidateQueries({ queryKey: ["academic-history"] });
    },
  });
};
