import { z } from "zod";

export const specialGroupSchema = z.object({
  groupName: z.string().nonempty("El nombre del CRP es requerido").min(2, "Debe tener al menos 2 caracteres"),
  teacherId: z.number({ message: "Seleccione un profesor" }).min(1, "Seleccione un profesor"),
  schoolYearId: z.number({ message: "Año escolar requerido" }).min(1, "Año escolar requerido"),
});

export type SpecialGroupFormValues = z.infer<typeof specialGroupSchema>;
