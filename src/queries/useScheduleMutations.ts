import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, deleteDataApi } from "@/services/api";

export const useAssignSchedule = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { teachingGroupId: number; scheduleSlotId: number; classroom?: string }) =>
      postDataApi("/schedules", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule"] });
      qc.invalidateQueries({ queryKey: ["section-schedule"] });
      qc.invalidateQueries({ queryKey: ["crp-schedule"] });
    },
  });
};

export const useAssignCRPSchedule = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { groupName: string; scheduleSlotId: number; classroom?: string }) =>
      postDataApi("/schedules/crp", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule"] });
      qc.invalidateQueries({ queryKey: ["section-schedule"] });
      qc.invalidateQueries({ queryKey: ["crp-schedule"] });
    },
  });
};

export const useAssignAllCRPSchedule = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { scheduleSlotId: number; classroom?: string }) =>
      postDataApi("/schedules/crp/all", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule"] });
      qc.invalidateQueries({ queryKey: ["section-schedule"] });
      qc.invalidateQueries({ queryKey: ["crp-schedule"] });
    },
  });
};

export const useRemoveSchedule = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/schedules", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule"] });
      qc.invalidateQueries({ queryKey: ["section-schedule"] });
      qc.invalidateQueries({ queryKey: ["crp-schedule"] });
    },
  });
};
