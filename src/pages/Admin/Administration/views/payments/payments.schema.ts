import { z } from "zod";

export const step1Schema = z.object({
  studentId: z.number({ message: "Selecciona un estudiante" }),
  feeId: z.number({ message: "Selecciona un tipo de deuda" }),
  totalAmount: z
    .number({ message: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0"),
  currency: z.enum(["USD", "VES"], { message: "Selecciona una moneda" }),
  paymentMethodId: z.number({ message: "Selecciona un método de pago" }),
  description: z.string({ message: "Ingresa una descripción" }),
  paymentDate: z.date({ message: "Selecciona una fecha" }),
});

export const step2Schema = z.object({
  payerName: z.string().optional(),
  payerIdentification: z.string().optional(),
  payerPhone: z.string().optional(),
  reference: z.string().optional(),
});

export const extendedSchema = z.object({
  exchangeRate: z.number().optional(),
});

export const paymentSchema = step1Schema.merge(step2Schema).merge(extendedSchema);

export type PaymentFormValues = z.input<typeof paymentSchema>;
