import { z } from "zod";

export const representativeSchema = z.object({
  firstNames: z.string().nonempty("Nombres requeridos").min(2, "Nombres requeridos"),
  lastNames: z.string().nonempty("Apellidos requeridos").min(2, "Apellidos requeridos"),
  identificationNumber: z.string().nonempty("Cédula requerida").min(7, "La cédula debe tener al menos 7 caracteres"),
  birthDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "Fecha de nacimiento inválida",
  }),
  gender: z.string().nonempty("Género requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  studentId: z.number({ message: "Debe seleccionar un estudiante" }).optional(),
  relationship: z.string().optional(),
});

export const representativeCreateSchema = representativeSchema.superRefine((data, ctx) => {
  if (!data.studentId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debe seleccionar un estudiante",
      path: ["studentId"],
    });
  }
  if (!data.relationship) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Indique la relación con el estudiante",
      path: ["relationship"],
    });
  }
});

export const representativeEditSchema = representativeSchema;

export type RepresentativeFormValues = z.infer<typeof representativeSchema>;
