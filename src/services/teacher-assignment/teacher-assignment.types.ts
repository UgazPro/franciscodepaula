export interface TeacherAssignmentResponse {
  id: number;
  teacherId: number;
  levelSubjectId: number;
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
  levelSubject: {
    id: number;
    subject: {
      id: number;
      subject: string;
      code: string | null;
      status: boolean | null;
    };
    highSchoolLevel: {
      id: number;
      level: string;
    };
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

export interface LevelData {
  highSchoolLevelId: number;
  level: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  sections: SectionData[];
}

export interface SectionData {
  sectionId: number;
  section: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  subjects: SubjectData[];
}

export interface SubjectData {
  levelSubjectId: number;
  subjectId: number;
  subject: string;
  subjectCode: string | null;
  assignment: AssignmentData | null;
}

export interface AssignmentData {
  id: number;
  teacherId: number;
  teacherName: string;
  status: boolean | null;
}

export interface TeacherAssignmentsViewProps {
  tabsComponent?: React.ReactNode;
}

export interface SpecialGroupResponse {
  id: number;
  teacherId: number;
  levelSubjectId: number;
  schoolYearId: number;
  sectionId: number | null;
  groupName: string;
  isSpecialGroup: boolean;
  assignedAt: string;
  status: boolean | null;
  totalLevels?: number;
  totalStudents?: number;
  _count?: { studentGroups: number };
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
  levelSubject: {
    id: number;
    subject: {
      id: number;
      subject: string;
      code: string | null;
      status: boolean | null;
    };
    highSchoolLevel: {
      id: number;
      level: string;
    };
  };
  schoolYear: {
    id: number;
    name: string;
    isActive: boolean | null;
  };
}

export interface CreateSpecialGroupData {
  teacherId: number;
  levelSubjectId: number;
  schoolYearId: number;
  groupName: string;
}

export interface UpdateSpecialGroupData {
  teacherId?: number;
  levelSubjectId?: number;
  schoolYearId?: number;
  groupName?: string;
}

export interface CRPStudentResponse {
  id: number;
  studentEnrollmentId: number;
  teachingGroupId: number;
  joinedAt: string;
  studentEnrollment: {
    id: number;
    studentId: number;
    sectionId: number;
    student: {
      id: number;
      person: {
        id: number;
        firstNames: string;
        lastNames: string;
        identificationNumber: string;
        gender: string;
      };
    };
    section: {
      id: number;
      section: string;
      highSchoolLevel: {
        id: number;
        level: string;
      };
    };
  };
  teachingGroup: {
    id: number;
    levelSubject: {
      highSchoolLevel: {
        id: number;
        level: string;
      };
    };
  };
}

export interface AvailableStudentResponse {
  id: number;
  studentId: number;
  sectionId: number;
  student: {
    id: number;
    person: {
      id: number;
      firstNames: string;
      lastNames: string;
      identificationNumber: string;
      gender: string;
    };
  };
  section: {
    id: number;
    section: string;
    highSchoolLevel: {
      id: number;
      level: string;
    };
  };
}
