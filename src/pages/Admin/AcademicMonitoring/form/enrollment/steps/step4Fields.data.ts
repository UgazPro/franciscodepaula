import type { FormField } from "@/components/form/formComponent.interface";

export const step4Fields: FormField[] = [
  {
    name: "schoolYearId",
    label: "Año Escolar",
    type: "select",
    placeholder: "Seleccione año escolar",
    options: [],
  },
  {
    name: "levelId",
    label: "Nivel",
    type: "select",
    placeholder: "Seleccione nivel",
    options: [],
  },
  {
    name: "sectionId",
    label: "Sección",
    type: "select",
    placeholder: "Seleccione sección",
    options: [],
  },
  {
    name: "enrollmentDate",
    label: "Fecha de Inscripción",
    type: "date",
  },
];

export const step4ByName = Object.fromEntries(
  step4Fields.map((f) => [f.name, f]),
) as Record<string, FormField>;
