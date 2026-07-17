import { z } from "zod";

export const evaluationSchema = z.object({
  topic: z.string().nonempty("El tema es requerido").min(2, "Debe tener al menos 2 caracteres"),
  evaluationType: z.string().nonempty("El tipo de evaluación es requerido").min(1, "Ingrese un tipo de evaluación"),
  percentage: z.number({ message: "La ponderación es requerida" }).min(1, "Mínimo 1").max(30, "Máximo 30"),
  objectives: z.string().optional(),
  dueDate: z.date().optional(),
});

export type EvaluationFormValues = z.infer<typeof evaluationSchema>;
