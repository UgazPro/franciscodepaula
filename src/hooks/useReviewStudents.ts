import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

export interface ReviewSubjectGrade {
  levelSubjectId: number;
  subjectCode: string;
  subjectName: string;
  average3Moments: number | null;
  passed: boolean;
  reviewScore: number | null;
}

export interface ReviewSubject {
  levelSubjectId: number;
  subjectCode: string;
  subjectName: string;
}

export interface ReviewStudent {
  studentId: number;
  studentName: string;
  identification: string;
  section: string;
  sectionId: number;
  subjectGrades: ReviewSubjectGrade[];
}

export interface ReviewLevel {
  highSchoolLevelId: number;
  level: string;
  studentCount: number;
  subjects: ReviewSubject[];
  students: ReviewStudent[];
}

export interface ReviewStudentsResponse {
  success: boolean;
  data: ReviewLevel[];
}

export const useReviewStudents = () => {
  return useQuery<ReviewStudentsResponse>({
    queryKey: ["review-students"],
    queryFn: () => getDataApi("/academic-history/review-students"),
    staleTime: 1000 * 60 * 2,
  });
};
