import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi } from "@/services/api";

const invalidateEvaluations = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["evaluations"] });
  qc.invalidateQueries({ queryKey: ["teacher-planning"] });
  qc.invalidateQueries({ queryKey: ["grade-teacher-planning"] });
  qc.invalidateQueries({ queryKey: ["grade-detail"] });
};

export const useCreateEvaluation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      teachingGroupId: number;
      periodId: number;
      evaluationType: string;
      topic: string;
      objectives?: string;
      percentage: number;
      dueDate?: string;
    }) => postDataApi("/evaluations", data),
    onSuccess: () => {
      invalidateEvaluations(qc);
    },
  });
};
