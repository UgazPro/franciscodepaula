import { z } from "zod";

export const employeeSchema = z.object({
  firstNames: z.string().nonempty("Nombres requeridos").min(2, "Nombres requeridos"),
  lastNames: z.string().nonempty("Apellidos requeridos").min(2, "Apellidos requeridos"),
  identificationNumber: z.string().nonempty("Cédula requerida").min(7, "La cédula debe tener al menos 7 caracteres"),
  birthDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "Fecha de nacimiento inválida",
  }),
  gender: z.string().nonempty("Género requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  roleId: z.number({ message: "Seleccione un rol" }),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
