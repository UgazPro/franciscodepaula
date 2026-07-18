import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";

export interface SchoolHistoryRecord {
  studentId: number;
  levelSubjectId?: number | null;
  schoolId: number;
  schoolYear?: number | null;
  finalScore?: number | null;
}

export interface SchoolHistoryUpdateItem {
  id: number;
  schoolId?: number;
  schoolYear?: number | null;
  finalScore?: number | null;
}

export const useCreateSchoolHistoryBatch = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { records: SchoolHistoryRecord[] }) =>
      postDataApi("/academic-history/school-history/batch", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic-history"] });
    },
  });
};

export const useUpdateSchoolHistory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { schoolId?: number; schoolYear?: number | null; finalScore?: number | null } }) =>
      putDataApi(`/academic-history/school-history/${id}`, data as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic-history"] });
    },
  });
};

export const useUpdateSchoolHistoryBatch = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { updates: SchoolHistoryUpdateItem[] }) =>
      putDataApi("/academic-history/school-history/batch", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic-history"] });
    },
  });
};
