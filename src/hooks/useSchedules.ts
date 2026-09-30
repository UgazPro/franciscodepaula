import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export interface ScheduleEntry {
  id: number;
  teachingGroupId: number | null;
  subject: string;
  subjectCode: string;
  level: string | null;
  section: string | null;
  groupName: string | null;
  isSpecialGroup: boolean;
  teacherName?: string;
  dayOfWeek: number;
  hour: number;
  order: number;
  classroom: string | null;
  isRecess: boolean;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
}

interface ScheduleResponse {
  success: boolean;
  data: ScheduleEntry[];
}

interface TimeSlotResponse {
  success: boolean;
  data: TimeSlot[];
}

export const useTeacherSchedule = (teacherId: number | null) => {
  return useQuery<ScheduleResponse>({
    queryKey: ["teacher-schedule", teacherId],
    queryFn: () => getDataApi(`/schedules/teacher/${teacherId}`),
    staleTime: 1000 * 60 * 2,
    enabled: !!teacherId,
  });
};

export const useSectionSchedule = (sectionId: number | null) => {
  return useQuery<ScheduleResponse>({
    queryKey: ["section-schedule", sectionId],
    queryFn: () => getDataApi(`/schedules/section/${sectionId}`),
    staleTime: 1000 * 60 * 2,
    enabled: !!sectionId,
  });
};

export const useCRPSchedule = (enabled: boolean = false) => {
  return useQuery<ScheduleResponse>({
    queryKey: ["crp-schedule"],
    queryFn: () => getDataApi("/schedules/crp"),
    staleTime: 1000 * 60 * 2,
    enabled,
  });
};

export const useTimeSlots = () => {
  return useQuery<TimeSlotResponse>({
    queryKey: ["time-slots"],
    queryFn: () => getDataApi("/schedule-config/time-slots"),
    staleTime: 1000 * 60 * 5,
  });
};
