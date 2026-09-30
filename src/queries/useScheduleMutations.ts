import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";

export const useAssignSchedule = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { teachingGroupId?: number; dayOfWeek: number; hour: number; order: number; classroom?: string; isRecess?: boolean }) =>
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
    mutationFn: (data: { groupName: string; dayOfWeek: number; hour: number; order: number; classroom?: string }) =>
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
    mutationFn: (data: { dayOfWeek: number; hour: number; order: number; classroom?: string }) =>
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

// Time slot mutations
export const useCreateTimeSlot = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { startTime: string; endTime: string }) =>
      postDataApi("/schedule-config/time-slots", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-slots"] });
    },
  });
};

export const useUpdateTimeSlot = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { startTime?: string; endTime?: string } }) =>
      putDataApi(`/schedule-config/time-slots/${id}`, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-slots"] });
    },
  });
};

export const useDeleteTimeSlot = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/schedule-config/time-slots", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-slots"] });
    },
  });
};

export const useBulkCreateTimeSlots = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { startTime: string; durationMinutes: number; count: number }) =>
      postDataApi("/schedule-config/time-slots/bulk", data as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time-slots"] });
    },
  });
};
