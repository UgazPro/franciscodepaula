import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export const useGradeTeacherPlanning = () => {
  return useQuery({
    queryKey: ["grade-teacher-planning"],
    queryFn: () => getDataApi("/grades/teacher-planning"),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGradeDetail = (teachingGroupId: number | null, periodId?: number | null) => {
  return useQuery({
    queryKey: ["grade-detail", teachingGroupId, periodId],
    queryFn: () => {
      const params = periodId ? `?periodId=${periodId}` : "";
      return getDataApi(`/grades/teaching-group/${teachingGroupId}${params}`);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!teachingGroupId,
  });
};
