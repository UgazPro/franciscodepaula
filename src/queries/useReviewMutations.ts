import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi } from "@/services/api";

export interface ReviewGradeData {
  studentId: number;
  levelSubjectId: number;
  sectionId: number;
  schoolId: number;
  schoolYearId: number;
  finalScore: number;
}

export const useSaveReviewGrade = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewGradeData) =>
      postDataApi("/academic-history/review", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-students"] });
    },
  });
};
