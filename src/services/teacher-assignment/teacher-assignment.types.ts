export interface TeacherAssignmentResponse {
  id: number;
  teacherId: number;
  subjectId: number;
  sectionId: number;
  status: boolean | null;
  employee: {
    id: number;
    user: {
      id: number;
      email: string;
      phone: string | null;
      person: {
        id: number;
        firstNames: string;
        lastNames: string;
        identificationNumber: string;
        gender: string;
        birthDate: Date;
        profilePhoto: string;
      };
    };
  };
  subject: {
    id: number;
    subject: string;
    code: string | null;
    status: boolean | null;
  };
  section: {
    id: number;
    section: string;
    highSchoolLevel: {
      id: number;
      level: string;
    };
    schoolYear: {
      id: number;
      name: string;
      isActive: boolean | null;
    };
  };
}
