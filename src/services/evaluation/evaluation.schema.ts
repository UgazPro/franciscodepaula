import { z } from "zod";

export const evaluationSchema = z.object({
  topic: z.string().nonempty("El tema es requerido").min(2, "Debe tener al menos 2 caracteres"),
  evaluationTypeId: z.number({ message: "Seleccione un tipo de evaluación" }).min(1, "Seleccione un tipo de evaluación"),
  percentage: z.number({ message: "La ponderación es requerida" }).min(0.01, "Mínimo 0.01").max(100, "Máximo 100"),
  maxScore: z.number({ message: "La nota máxima es requerida" }).min(1, "Mínimo 1"),
  objectives: z.string().optional(),
  dueDate: z.date().optional(),
});

export type EvaluationFormValues = z.infer<typeof evaluationSchema>;
