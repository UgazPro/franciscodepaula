import type { FormField } from "@/components/form/formComponent.interface";

export const step1Fields: FormField[] = [
  {
    name: "firstNames",
    label: "Nombres",
    type: "text",
    placeholder: "Ej: María José",
  },
  {
    name: "lastNames",
    label: "Apellidos",
    type: "text",
    placeholder: "Ej: González Pérez",
  },
  {
    name: "identificationNumber",
    label: "Cédula",
    type: "text",
    placeholder: "Ej: V-12345678",
  },
  {
    name: "birthDate",
    label: "Fecha de Nacimiento",
    type: "date",
  },
  {
    name: "gender",
    label: "Género",
    type: "select",
    placeholder: "Seleccione un género",
    options: [
      { label: "Masculino", value: "Masculino" },
      { label: "Femenino", value: "Femenino" },
    ],
  },
];

export const step1ByName = Object.fromEntries(
  step1Fields.map((f) => [f.name, f])
) as Record<string, FormField>;
