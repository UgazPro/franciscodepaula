export interface StudentScholarshipResponse {
  id: number;
  studentId: number;
  schoolYearId: number;
  amount: number;
  assignedById: number;
  assignedDate: string;
  startDate: string;
  endDate: string | null;
  reason: string | null;
  status: boolean;
  student: {
    id: number;
    personId: number;
    status: boolean;
    person: {
      id: number;
      firstNames: string;
      lastNames: string;
      identificationNumber: string;
    };
  };
  schoolYear: {
    id: number;
    name: string;
  };
  assignedBy: {
    id: number;
    userId: number;
    user: {
      id: number;
      person: {
        id: number;
        firstNames: string;
        lastNames: string;
      };
    };
  };
}

export interface CreateScholarshipDTO {
  studentId: number;
  schoolYearId: number;
  amount: number;
  assignedById: number;
  startDate: string;
  endDate?: string;
  reason?: string;
}

export interface UpdateScholarshipDTO {
  amount?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: boolean;
}
