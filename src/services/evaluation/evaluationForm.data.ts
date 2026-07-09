import type { FormField } from "@/components/form/formComponent.interface";

export const evaluationFields: FormField[] = [
  {
    name: "topic",
    label: "Tema",
    type: "text",
    placeholder: "Ej: Examen Parcial, Tarea #3...",
  },
  {
    name: "evaluationType",
    label: "Tipo de Evaluación",
    type: "text",
    placeholder: "Ej: Examen, Tarea, Proyecto...",
  },
  {
    name: "percentage",
    label: "Ponderación",
    type: "text",
    placeholder: "Ej: 20",
  },
  {
    name: "objectives",
    label: "Objetivos (Opcional)",
    type: "textarea",
  },
  {
    name: "dueDate",
    label: "Fecha de Evaluación (Opcional)",
    type: "date",
  },
];

export const evaluationFieldsByName = Object.fromEntries(
  evaluationFields.map((f) => [f.name, f])
) as Record<string, FormField>;
