import type { FormField } from "@/components/form/formComponent.interface";

export const specialGroupFields: FormField[] = [
  {
    name: "groupName",
    label: "Nombre del CRP",
    type: "text",
    placeholder: "Ej: Karate, Pintura, Bordado...",
  },
  {
    name: "teacherId",
    label: "Profesor",
    type: "select",
    placeholder: "Seleccione un profesor",
    options: [],
  },
];

export const specialGroupFieldsByName = Object.fromEntries(
  specialGroupFields.map((f) => [f.name, f])
) as Record<string, FormField>;
