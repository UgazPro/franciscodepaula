import type { FormField } from "@/components/form/formComponent.interface";

export const formFields: FormField[] = [
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

export const formFieldsByName = Object.fromEntries(
  formFields.map((f) => [f.name, f]),
) as Record<string, FormField>;
