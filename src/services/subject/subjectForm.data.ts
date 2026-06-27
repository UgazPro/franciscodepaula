import type { FormField } from "@/components/form/formComponent.interface";

export const subjectFields: FormField[] = [
  {
    name: "subject",
    label: "Nombre de la Materia",
    type: "text",
    placeholder: "Ej: Matemática, Lengua, Ciencias...",
  },
  {
    name: "code",
    label: "Código",
    type: "text",
    placeholder: "Ej: MAT-01 (opcional)",
  },
];

export const subjectFieldsByName = Object.fromEntries(
  subjectFields.map((f) => [f.name, f])
) as Record<string, FormField>;
