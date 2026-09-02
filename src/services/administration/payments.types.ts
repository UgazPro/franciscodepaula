export interface PaymentResponse {
  id: number;
  paymentMethodId: number;
  exchangeId: number | null;
  totalAmount: number;
  currency: "USD" | "VES";
  paymentDate: string;
  reference: string | null;
  zellePayer: string | null;
  payerName: string | null;
  payerIdentification: string | null;
  payerPhone: string | null;
  description: string | null;
  status: boolean;
  paymentMethod: PaymentMethod;
  exchange: Exchange | null;
  studentFeePayments: StudentFeePaymentResponse[];
}

export interface PaymentMethod {
  id: number;
  paymentType: {
    id: number;
    type: string;
    currency: "USD" | "VES";
  };
  bank: string | null;
  accountNumber: string | null;
  identification: string | null;
  email: string | null;
  phone: string | null;
  owner: string | null;
  active: boolean;
}

export interface FeeResponse {
  id: number;
  name: string;
  schoolYearId: number;
  value: number;
  createdAt: string;
  startAt: string;
  endAt: string;
  appliesScholarship: boolean;
  schoolYear?: {
    id: number;
    name: string;
  };
}

export interface StudentFeePaymentResponse {
  id: number;
  studentFeeId: number;
  paymentId: number;
  amount: number;
  studentFee: StudentFeeResponse;
}

export interface StudentFeeResponse {
  id: number;
  studentId: number;
  feeId: number;
  status: boolean | null;
  student: {
    id: number;
    personId: number;
    status: boolean;
    person: {
      id: number;
      firstNames: string;
      lastNames: string;
      identificationNumber: string;
      profilePhoto: string | null;
    };
  };
  fee: FeeResponse;
}

export interface Exchange {
  id: number;
  rate: number;
  date: string;
  setByUser: boolean;
}

export interface ExchangeResponse {
  latest: Exchange | null;
  defaultRate: Exchange | null;
}

export interface PaymentEntry {
  id: string;
  paymentMethodId: number;
  amount: number;
  reference: string;
  zellePayer: string;
}

export interface StudentWithDebts {
  id: number;
  personId: number;
  status: boolean;
  person: {
    id: number;
    firstNames: string;
    lastNames: string;
    identificationNumber: string;
    profilePhoto: string | null;
  };
  debts: {
    feeId: number;
    feeName: string;
    totalValue: number;
    paidAmount: number;
    pending: number;
    schoolYearName?: string;
  }[];
  representatives?: {
    representative: {
      user: {
        person: {
          firstNames: string;
          lastNames: string;
          identificationNumber: string;
        };
        phone: string | null;
      };
    };
  }[];
}

export interface PaymentFormValues {
  exchangeRate: number;
  totalAmount: number;
  payerName: string;
  payerIdentification: string;
  payerPhone: string;
  reference: string;
  description: string;
  paymentDate: Date;
  paymentEntries: PaymentEntry[];
}
