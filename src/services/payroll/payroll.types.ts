export type PayrollHalf = "FIRST_HALF" | "SECOND_HALF";

export interface PayrollPeriod {
  id: number;
  month: number;
  year: number;
  half: PayrollHalf;
  startDate: string | null;
  endDate: string | null;
  status: boolean | null;
  payrollRecords: PayrollRecord[];
}

export interface PayrollEmployee {
  id: number;
  firstName: string;
  lastName: string;
  identification: string;
  roles: string[];
  isDocente: boolean;
  baseHourRate: number | null;
  fixedSalary: number | null;
  hireDate: string | null;
}

export interface PayrollPreviewItem {
  employeeId: number;
  firstName: string;
  lastName: string;
  identification: string;
  type: "Docente" | "Administrativo";
  hourlyRate: number | null;
  workedHours: number | null;
  grossSalary: number;
  fixedSalary: number | null;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  payrollPeriodId: number;
  hourlyRate: number | null;
  workedHours: number | null;
  grossSalary: number | null;
  deductions: number;
  bonuses: number;
  netSalary: number | null;
  currency: string | null;
  paymentStatus: string | null;
  paymentDate: string | null;
  generatedAt: string;
  employee: {
    id: number;
    user: {
      person: {
        firstNames: string;
        lastNames: string;
        identificationNumber: string;
      };
    };
  };
  payrollPeriod: PayrollPeriod;
  adjustments: {
    id: number;
    type: string;
    concept: string;
    amount: number;
  }[];
}

export interface CreatePayrollPeriodDTO {
  month: number;
  year: number;
  half: PayrollHalf;
  startDate?: string;
  endDate?: string;
}

export interface GeneratePayrollDTO {
  payrollPeriodId: number;
}
