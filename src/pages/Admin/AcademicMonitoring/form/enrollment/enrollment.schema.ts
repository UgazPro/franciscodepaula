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

export const step3Schema = z.object({
  representativeFirstNames: z
    .string()
    .min(2, "Los nombres del representante son requeridos"),
  representativeLastNames: z
    .string()
    .min(2, "Los apellidos del representante son requeridos"),
  representativeIdentification: z
    .string()
    .min(6, "La cédula del representante es requerida"),
  representativeBirthDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "La fecha de nacimiento del representante es requerida",
  }),
  representativeGender: z
    .string()
    .min(1, "Seleccione el género del representante"),
  representativeEmail: z.string().email("Email inválido"),
  representativePhone: z
    .string()
    .min(10, "El teléfono del representante es requerido"),
  representativeRelation: z
    .string()
    .min(2, "Indique la relación con el estudiante"),
  representativeProfession: z.string().optional(),
});

export const step4Schema = z.object({
  schoolYearId: z.number({ message: "Selecciona un año escolar" }),
  levelId: z.number({ message: "Selecciona un nivel" }),
  sectionId: z.number({ message: "Selecciona una sección" }),
  enrollmentDate: z.date({ message: "Selecciona una fecha" }),
});

export const enrollmentSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;
