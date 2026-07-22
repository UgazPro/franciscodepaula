export interface GradePlanningSection {
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
  evaluationCount: number;
  loadedPercentage: number;
}

export interface GradeStudent {
  id: number;
  person: {
    firstNames: string;
    lastNames: string;
    identificationNumber: string;
  };
}

export interface GradeEvaluation {
  id: number;
  topic: string;
  percentage: number;
  evaluationType: { evaluationType: string };
}

export interface GradeRecord {
  studentId: number;
  evaluationId: number;
  score: number | null;
}

export interface GradeTeachingGroupDetail {
  students: GradeStudent[];
  evaluations: GradeEvaluation[];
  grades: GradeRecord[];
}

export interface SaveGradeData {
  studentId: number;
  evaluationId: number;
  score: number;
  observations?: string;
}

export interface TeacherOverview {
  teacherId: number;
  teacherName: string;
  teacherPhoto: string | null;
  identificationNumber: string;
  loadedCount: number;
  totalCount: number;
  groups: TeacherGroupRow[];
}

export interface TeacherGroupRow {
  teachingGroupId: number;
  level: string;
  section: string;
  subject: string;
  evaluationCount: number;
  totalPercentage: number;
  loadedPercentage: number;
  isLoaded: boolean;
}

export interface GradeStudentRow {
  id: number;
  firstNames: string;
  lastNames: string;
  identificationNumber: string;
  grades: Record<number, number | null>;
  definitiva: number;
  hasMissingGrades: boolean;
}
