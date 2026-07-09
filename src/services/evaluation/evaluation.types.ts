export interface TeacherPlanningSection {
  teachingGroupId: number;
  sectionId: number | null;
  section: string;
  level: string;
  subject: string;
  subjectId: number;
  levelSubjectId: number;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  isSpecialGroup: boolean;
  sections: string;
  groupName: string | null;
}

export interface EvaluationTypeResponse {
  id: number;
  evaluationType: string;
}

export interface EvaluationResponse {
  id: number;
  teachingGroupId: number;
  periodId: number;
  evaluationTypeId: number;
  topic: string;
  objectives: string | null;
  percentage: number;
  dueDate: string | null;
  createdAt: string;
  evaluationType: EvaluationTypeResponse;
  period: {
    id: number;
    period: string;
    schoolYearId: number;
  };
}

export interface CreateEvaluationData {
  teachingGroupId: number;
  periodId: number;
  evaluationType: string;
  topic: string;
  objectives?: string;
  percentage: number;
  dueDate?: string;
}
