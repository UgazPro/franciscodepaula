import { z } from "zod";

export const step1Schema = z.object({
  firstNames: z.string().min(2, "Los nombres son requeridos"),
  lastNames: z.string().min(2, "Los apellidos son requeridos"),
  identificationNumber: z.string().min(6, "La cédula es requerida"),
  birthDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "La fecha de nacimiento es requerida",
  }),
  gender: z.string().min(1, "Seleccione un género"),
  profilePhoto: z.string().optional(),
});

export const step2Schema = z.object({
  birthCountry: z.string().min(1, "El país de nacimiento es requerido"),
  state: z.string().min(1, "El estado es requerido"),
  municipality: z.string().min(1, "El municipio es requerido"),
  parish: z.string().min(1, "La parroquia de nacimiento es requerida"),
  currentParish: z.string().min(1, "La parroquia donde vive es requerida"),
  previousSchool: z.string().optional(),
  admissionDate: z.date().optional(),
  address: z.string().min(5, "La dirección es requerida"),
});

export const step3BaseSchema = z.object({
  representativeMode: z.enum(["create", "existing"]),
  representativeFirstNames: z.string().optional(),
  representativeLastNames: z.string().optional(),
  representativeIdentification: z.string().optional(),
  representativeBirthDate: z.date().or(z.string()).optional(),
  representativeGender: z.string().optional(),
  representativeEmail: z.string().optional(),
  representativePhone: z.string().optional(),
  representativeRelation: z.string().optional(),
  representativeProfession: z.string().optional(),
  existingRepresentative: z.any().optional(),
});

export const step4Schema = z.object({
  schoolYearId: z.number({ message: "Selecciona un año escolar" }),
  levelId: z.number({ message: "Selecciona un nivel" }),
  sectionId: z.number({ message: "Selecciona una sección" }),
  enrollmentDate: z.date({ message: "Selecciona una fecha" }),
});

export const enrollmentSchema = step1Schema
  .merge(step2Schema)
  .merge(step3BaseSchema)
  .merge(step4Schema)
  .superRefine((data, ctx) => {
    if (data.representativeMode === "create") {
      if (!data.representativeFirstNames || data.representativeFirstNames.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Los nombres del representante son requeridos",
          path: ["representativeFirstNames"],
        });
      }
      if (!data.representativeLastNames || data.representativeLastNames.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Los apellidos del representante son requeridos",
          path: ["representativeLastNames"],
        });
      }
      if (!data.representativeIdentification || data.representativeIdentification.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cédula del representante es requerida",
          path: ["representativeIdentification"],
        });
      }
      if (!data.representativeBirthDate || isNaN(new Date(data.representativeBirthDate as any).getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de nacimiento del representante es requerida",
          path: ["representativeBirthDate"],
        });
      }
      if (!data.representativeGender) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione el género del representante",
          path: ["representativeGender"],
        });
      }
      if (!data.representativeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.representativeEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email inválido",
          path: ["representativeEmail"],
        });
      }
      if (!data.representativePhone || data.representativePhone.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El teléfono del representante es requerido",
          path: ["representativePhone"],
        });
      }
      if (!data.representativeRelation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique la relación con el estudiante",
          path: ["representativeRelation"],
        });
      }
    } else if (data.representativeMode === "existing") {
      if (!data.existingRepresentative) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione un representante existente",
          path: ["existingRepresentative"],
        });
      }
      if (!data.representativeRelation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique la relación con el estudiante",
          path: ["representativeRelation"],
        });
      }
    }
  });

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;
