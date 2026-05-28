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
  status: boolean;
  paymentMethod: PaymentMethod;
  exchange: Exchange | null;
  charges: StudentChargeResponse[];
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

export interface ChargeType {
  id: number;
  name: string;
  description: string | null;
}

export interface Exchange {
  id: number;
  rate: number;
  date: string;
}

export interface StudentChargeResponse {
  id: number;
  studentId: number;
  paymentId: number | null;
  chargeTypeId: number;
  schoolYearId: number | null;
  description: string | null;
  createdAt: string;
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
  chargeType: ChargeType;
}

export interface PaymentFormValues {
  studentId: number;
  chargeTypeId: number;
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
