import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export interface ClassHour {
  id: number;
  block: number;
  startTime: string;
  endTime: string;
  type: string;
}

export interface ScheduleEntry {
  id: number;
  teachingGroupId: number;
  subject: string;
  subjectCode: string;
  level: string;
  section: string | null;
  groupName: string | null;
  isSpecialGroup: boolean;
  teacherName?: string;
  slotId: number;
  dayOfWeek: number;
  block: number;
  startTime: string;
  endTime: string;
  classroom: string | null;
}

interface ClassHoursResponse {
  success: boolean;
  data: ClassHour[];
}

interface ScheduleResponse {
  success: boolean;
  data: ScheduleEntry[];
}

export const useClassHours = () => {
  return useQuery<ClassHoursResponse>({
    queryKey: ["class-hours"],
    queryFn: () => getDataApi("/schedules/class-hours"),
    staleTime: 1000 * 60 * 10,
  });
};

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
