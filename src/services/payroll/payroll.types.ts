export interface PayrollPeriod {
  id: number;
  payrollHalf: number;
  schoolYearId: number;
  startDate: string | null;
  endDate: string | null;
  schoolYear: { id: number; name: string };
  payrollRecords: PayrollRecord[];
}

export interface PayrollEmployee {
  id: number;
  firstName: string;
  lastName: string;
  identification: string;
  roles: string[];
  type: string | null;
  salary: number | null;
  hireDate: string | null;
}

export interface TeacherHourCost {
  id: number;
  costPerHour: number | null;
}

export interface PayrollPreviewItem {
  employeeId: number;
  firstName: string;
  lastName: string;
  identification: string;
  type: string | null;
  grossSalary: number;
  teacherHourCostId: number | null;
  costPerHour: number | null;
  workedHours: number | null;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  payrollPeriodId: number;
  teacherHourCostId: number | null;
  grossSalary: number | null;
  currency: string | null;
  paymentDate: string | null;
  exchangeId: number | null;
  generatedAt: string;
  employee: {
    id: number;
    type: string | null;
    salary: number | null;
    user: {
      person: {
        firstNames: string;
        lastNames: string;
        identificationNumber: string;
      };
    };
  };
  payrollPeriod: PayrollPeriod;
  teacherHourCost: TeacherHourCost | null;
  exchange: { id: number; rate: number } | null;
  adjustments: {
    id: number;
    type: string;
    concept: string;
    amount: number;
  }[];
}

export interface CreatePayrollPeriodDTO {
  payrollHalf: number;
  schoolYearId: number;
  startDate?: string;
  endDate?: string;
}

export interface GeneratePayrollDTO {
  payrollPeriodId: number;
}
