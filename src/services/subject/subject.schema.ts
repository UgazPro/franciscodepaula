import { z } from "zod";

export const subjectSchema = z.object({
  subject: z.string().nonempty("El nombre de la materia es requerido").min(2, "Debe tener al menos 2 caracteres"),
  code: z.string().optional(),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
