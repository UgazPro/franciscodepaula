import { z } from "zod";

export const completeEnrollmentSchema = z.object({
  schoolYearId: z.number({ message: "Selecciona un año escolar" }),
  levelId: z.number({ message: "Selecciona un nivel" }),
  sectionId: z.number({ message: "Selecciona una sección" }),
  enrollmentDate: z.date({ message: "Selecciona una fecha" }),
});

export type CompleteEnrollmentFormValues = z.input<typeof completeEnrollmentSchema>;
