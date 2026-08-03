import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi } from "@/services/api";

export interface GradeAdjustmentData {
  studentId: number;
  teachingGroupId: number;
  periodId: number;
  adjustment: number;
  reason?: string;
  createdBy?: number;
}

export const useSaveGradeAdjustments = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { adjustments: GradeAdjustmentData[] }) =>
      postDataApi("/grade-adjustments", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sabana-data"] });
      qc.invalidateQueries({ queryKey: ["academic-history"] });
    },
  });
};
