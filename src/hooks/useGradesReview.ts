import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export interface GradesReviewSubject {
  levelSubjectId: number;
  subjectName: string;
  subjectCode: string;
  teachingGroupId: number;
  teacherName: string;
  isSpecialGroup: boolean;
  periodGrade: number | null;
  totalEvaluations: number;
  gradedEvaluations: number;
}

export interface GradesReviewSection {
  sectionId: number;
  level: string;
  section: string;
  label: string;
  studentCount: number;
  subjects: GradesReviewSubject[];
  sectionAverage: number | null;
}

interface GradesReviewSectionsResponse {
  success: boolean;
  data: {
    sections: GradesReviewSection[];
  };
}

export const useGradesReviewSections = (periodId: number | null) => {
  return useQuery<GradesReviewSectionsResponse>({
    queryKey: ["grades-review-sections", periodId],
    queryFn: () =>
      getDataApi(`/grade-adjustments/grades-review?periodId=${periodId}`),
    staleTime: 1000 * 60 * 2,
    enabled: !!periodId,
  });
};

export interface SubjectGradeDetail {
  evaluationId: number;
  topic: string;
  percentage: number;
  evaluationType: string;
  score: number | null;
}

export interface SubjectStudent {
  studentId: number;
  studentName: string;
  grades: SubjectGradeDetail[];
  weightedAverage: number | null;
}

interface SubjectGradesResponse {
  success: boolean;
  data: {
    subject: {
      subjectName: string;
      teacherName: string;
      sectionLabel: string;
    };
    students: SubjectStudent[];
  };
}

export const useSubjectGrades = (
  teachingGroupId: number | null,
  periodId: number | null,
) => {
  return useQuery<SubjectGradesResponse>({
    queryKey: ["subject-grades", teachingGroupId, periodId],
    queryFn: () =>
      getDataApi(
        `/grade-adjustments/grades-review/subject?teachingGroupId=${teachingGroupId}&periodId=${periodId}`,
      ),
    staleTime: 1000 * 60 * 2,
    enabled: !!teachingGroupId && !!periodId,
  });
};
