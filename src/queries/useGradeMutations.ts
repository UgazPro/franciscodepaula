import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi } from "@/services/api";
import type { SaveGradeData } from "@/services/grade/grade.types";

export const useSaveGrades = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { grades: SaveGradeData[] }) =>
      postDataApi("/grades", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grade-detail"] });
      qc.invalidateQueries({ queryKey: ["subject-grades"] });
      qc.invalidateQueries({ queryKey: ["teachers-overview"] });
      qc.invalidateQueries({ queryKey: ["grade-teacher-planning"] });
    },
  });
};
