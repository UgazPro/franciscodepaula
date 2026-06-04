export interface PaymentResponse {
  id: number;
  paymentMethodId: number;
  exchangeId: number | null;
  totalAmount: number;
  currency: "USD" | "VES";
  paymentDate: string;
  reference: string | null;
  payerName: string | null;
  payerIdentification: string | null;
  payerPhone: string | null;
  description: string | null;
  status: boolean;
  paymentMethod: PaymentMethod;
  exchange: Exchange | null;
  studentFees: StudentFeeResponse[];
}

export interface PaymentMethod {
  id: number;
  type: string;
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
  schoolYear?: {
    id: number;
    name: string;
  };
}

export interface StudentFeeResponse {
  id: number;
  studentId: number;
  feeId: number;
  paymentId: number;
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
}

export interface PaymentFormValues {
  studentId: number;
  feeId: number;
  description: string;
  totalAmount: number;
  currency: "USD" | "VES";
  paymentMethodId: number;
  reference: string;
  payerName: string;
  payerIdentification: string;
  payerPhone: string;
  paymentDate: Date;
}
