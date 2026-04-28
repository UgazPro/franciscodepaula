import { z } from "zod";

export const studentSchema = z.object({

  //////////////////////////////////////////////////
  // PERSON DATA
  //////////////////////////////////////////////////
  profilePhoto: z.string().optional(),

  firstNames: z.string().nonempty("Nombres Requeridos").min(2, "Nombres requeridos"),

  lastNames: z.string().nonempty("Apellidos Requeridos").min(2, "Apellidos requeridos"),

  identificationNumber: z.string().nonempty('Cédula Requerida').min(7, "La cédula debe tener al menos 7 caracteres"),

  birthDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "Fecha de nacimiento inválida",
  }),

  gender: z.string().nonempty("Género Requerido"),

  //////////////////////////////////////////////////
  // STUDENT DATA
  //////////////////////////////////////////////////
  birthCountry: z.string().nonempty("País de Nacimiento Requerido"),

  state: z.string().nonempty("Estado Requerido"),

  parish: z.string().nonempty("Parroquia Requerida"),

  previousSchool: z.string().nonempty("Escuela Previa Requerida"),

  address: z.string().nonempty("Dirección Requerida"),

  status: z.boolean(),

  admissionDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "Fecha de admisión inválida",
  }),

  sectionId: z.number().optional()

});

export type StudentFormValues = z.infer<typeof studentSchema>;