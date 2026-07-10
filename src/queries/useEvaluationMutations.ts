import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";

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

export const useUpdateEvaluation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: number;
      evaluationType?: string;
      topic?: string;
      objectives?: string;
      percentage?: number;
      dueDate?: string;
    }) => {
      const { id, ...body } = data;
      return putDataApi(`/evaluations/${id}`, body as Record<string, unknown>);
    },
    onSuccess: () => {
      invalidateEvaluations(qc);
    },
  });
};

export const useDeleteEvaluation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/evaluations", id),
    onSuccess: () => {
      invalidateEvaluations(qc);
    },
  });
};
