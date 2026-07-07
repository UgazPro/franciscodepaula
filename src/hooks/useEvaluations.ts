import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useTeacherPlanning = () => {
  return useQuery({
    queryKey: ["teacher-planning"],
    queryFn: () => getDataApi("/evaluations/teacher-planning"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useEvaluationsByTeachingGroup = (teachingGroupId: number | null, periodId?: number | null) => {
  return useQuery({
    queryKey: ["evaluations", teachingGroupId, periodId],
    queryFn: () => {
      const params = periodId ? `?periodId=${periodId}` : "";
      return getDataApi(`/evaluations/teaching-group/${teachingGroupId}${params}`);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!teachingGroupId,
  });
};

export const useEvaluationTypes = () => {
  return useQuery({
    queryKey: ["evaluation-types"],
    queryFn: () => getDataApi("/evaluations/types"),
    staleTime: 1000 * 60 * 5,
  });
};
