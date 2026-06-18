import { z } from "zod";

export const step1Schema = z.object({
  exchangeRate: z.number({ message: "Ingresa la tasa de cambio" }).positive("La tasa debe ser mayor a 0"),
  currency: z.enum(["USD", "VES"], { message: "Selecciona una moneda" }),
  totalAmount: z
    .number({ message: "Ingresa un monto válido" })
    .positive("El monto debe ser mayor a 0"),
});

export const step2Schema = z.object({
  payerName: z.string().min(1, "El nombre del pagador es obligatorio"),
  payerIdentification: z.string().min(1, "La cédula del pagador es obligatoria"),
  payerPhone: z.string().min(1, "El teléfono del pagador es obligatorio"),
  reference: z.string().min(1, "La referencia es obligatoria"),
  paymentMethodId: z.number({ message: "Selecciona un método de pago" }),
  description: z.string({ message: "Ingresa una descripción" }),
  paymentDate: z.date({ message: "Selecciona una fecha" }),
});

export const paymentSchema = step1Schema.merge(step2Schema);

export type PaymentFormValues = z.input<typeof paymentSchema>;