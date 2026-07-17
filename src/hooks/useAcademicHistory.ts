import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export interface AcademicHistorySubject {
  subjectName: string;
  isSpecialGroup: boolean;
  definitiva: number | null;
  totalEvaluations: number;
  gradedEvaluations: number;
  grades: {
    evaluationId: number;
    topic: string;
    percentage: number;
    evaluationType: string;
    period: string;
    score: number | null;
  }[];
  periodAverages: {
    period: string;
    average: number | null;
  }[];
}

export interface AcademicHistoryFailedSubject {
  subjectName: string;
  finalAverage: number | null;
  typeOf: string | null;
  status: string | null;
  observations: string | null;
  date: string | null;
}

export interface AcademicHistoryEntry {
  schoolYearId: number | null;
  schoolYearName: string | null;
  level: string;
  section: string | null;
  schoolName: string;
  schoolId: number;
  averageGrade: number | null;
  totalSubjects: number | null;
  totalGrades: number | null;
  subjects: AcademicHistorySubject[];
  failedSubjects: AcademicHistoryFailedSubject[];
}

export interface AcademicHistoryData {
  studentId: number;
  studentName: string;
  currentSchool: { id: number; schoolName: string } | null;
  history: AcademicHistoryEntry[];
}

export const useAcademicHistory = (studentId: number | null) => {
  return useQuery<AcademicHistoryData>({
    queryKey: ["academic-history", studentId],
    queryFn: () => getDataApi(`/academic-history/student/${studentId}`),
    enabled: !!studentId,
  });
};
