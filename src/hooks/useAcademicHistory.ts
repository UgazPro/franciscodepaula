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

export interface AcademicHistorySubject {
  subjectName: string;
  teachingGroupId: number | null;
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
  typeOf: string | null;
}

export interface SchoolHistoryRecord {
  id: number;
  levelSubjectId: number | null;
  schoolId: number;
  schoolYearId: number | null;
  finalScore: number | null;
  subjectName: string;
}

export interface AcademicHistoryEntry {
  schoolYearId: number | null;
  schoolYearName: string | null;
  schoolYear: number | null;
  enrollmentTypeOf: string | null;
  level: string;
  section: string | null;
  schoolName: string;
  schoolId: number;
  averageGrade: number | null;
  totalSubjects: number | null;
  totalGrades: number | null;
  subjects: AcademicHistorySubject[];
  failedSubjects?: {
    levelSubjectId: number;
    highSchoolLevelId: number;
    subjectName: string;
    section: string | null;
    attempts: FailedSubjectAttempt[];
  }[];
  records?: SchoolHistoryRecord[];
}

export interface AcademicHistoryData {
  studentId: number;
  studentName: string;
  currentSchool: { id: number; schoolName: string } | null;
  history: AcademicHistoryEntry[];
  failedSubjects: {
    id: number;
    levelSubjectId: number;
    highSchoolLevelId: number;
    subjectName: string;
    section: string | null;
    attempts: FailedSubjectAttempt[];
  }[];
  enrollmentTypeOf: string | null;
}

export const useAcademicHistory = (studentId: number | null) => {
  return useQuery<AcademicHistoryData>({
    queryKey: ["academic-history", studentId],
    queryFn: () => getDataApi(`/academic-history/student/${studentId}`),
    enabled: !!studentId,
  });
};
