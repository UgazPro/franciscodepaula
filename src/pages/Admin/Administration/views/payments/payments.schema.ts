import { z } from "zod";

export const step1Schema = z.object({}).passthrough();

export const step2Schema = z.object({
  exchangeRate: z.number({ message: "Ingresa la tasa de cambio" }).positive("La tasa debe ser mayor a 0"),
  paymentDate: z.date({ message: "Selecciona una fecha" }),
  description: z.string().optional(),
});

export const step3Schema = z.object({
  payerName: z.string().min(1, "El nombre del pagador es obligatorio"),
  payerIdentification: z.string().min(1, "La cédula del pagador es obligatoria"),
  payerPhone: z.string().min(1, "El teléfono del pagador es obligatorio"),
});

export const paymentSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type PaymentFormValues = z.input<typeof paymentSchema>;
