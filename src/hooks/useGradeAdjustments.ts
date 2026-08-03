import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export interface SabanaSubject {
  levelSubjectId: number;
  subjectCode: string;
  subjectName: string;
  isSpecialGroup: boolean;
  teachingGroupId: number;
}

export interface SabanaStudentSubject {
  levelSubjectId: number;
  periodGrade: number | null;
  currentAdjustment: number | null;
  adjustmentId: number | null;
  teachingGroupId: number;
}

export interface SabanaStudent {
  studentId: number;
  studentName: string;
  identification: string;
  subjects: SabanaStudentSubject[];
}

export interface SabanaSection {
  sectionId: number;
  level: string;
  section: string;
  label: string;
  studentCount: number;
  maleCount: number;
  femaleCount: number;
  sectionAverage: number | null;
  subjects: SabanaSubject[];
  students: SabanaStudent[];
}

interface SabanaResponse {
  success: boolean;
  data: {
    sections: SabanaSection[];
  };
}

export const useSabanaData = (periodId: number | null) => {
  return useQuery<SabanaResponse>({
    queryKey: ["sabana-data", periodId],
    queryFn: () => getDataApi(`/grade-adjustments/sabana?periodId=${periodId}`),
    staleTime: 1000 * 60 * 2,
    enabled: !!periodId,
  });
};
