import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export interface FailedSubjectAttempt {
  id: number;
  score: number | null;
  evaluationDate: string | null;
  observations: string | null;
  createdAt: string;
  createdBy: number | null;
}

export interface FailedSubjectItem {
  id: number;
  levelSubjectId: number;
  subjectName: string;
  attempts: FailedSubjectAttempt[];
}

export interface FailedSubjectStudent {
  studentId: number;
  studentName: string;
  identification: string;
  enrollmentTypeOf: string;
  currentLevel: string;
  currentSection: string;
  failedSubjects: FailedSubjectItem[];
}

export interface FailedSubjectLevel {
  highSchoolLevelId: number;
  level: string;
  studentCount: number;
  students: FailedSubjectStudent[];
}

export interface FailedSubjectsResponse {
  success: boolean;
  data: FailedSubjectLevel[];
}

export const useFailedSubjects = () => {
  return useQuery<FailedSubjectsResponse>({
    queryKey: ["failed-subjects"],
    queryFn: () => getDataApi("/academic-history/failed-subjects"),
    staleTime: 1000 * 60 * 2,
  });
};
