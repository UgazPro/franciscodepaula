import type { FormField } from "@/components/form/formComponent.interface";

export const relationshipOptions = [
  { label: "madre", value: "madre" },
  { label: "padre", value: "padre" },
  { label: "tio(a)", value: "tio(a)" },
  { label: "abuelo(a)", value: "abuelo(a)" },
  { label: "hermano mayor", value: "hermano mayor" },
  { label: "primo(a)", value: "primo(a)" },
  { label: "otro", value: "otro" },
];

export const representativeFields: FormField[] = [
  {
    name: "firstNames",
    label: "Nombres",
    type: "text",
  },
  {
    name: "lastNames",
    label: "Apellidos",
    type: "text",
  },
  {
    name: "identificationNumber",
    label: "Cédula",
    type: "text",
  },
  {
    name: "occupation",
    label: "Ocupación",
    type: "text",
  },
  {
    name: "birthDate",
    label: "Fecha de Nacimiento",
    type: "date",
  },
  {
    name: "gender",
    placeholder: "Seleccione un Género",
    label: "Género",
    type: "select",
    options: [
      { label: "Masculino", value: "Masculino" },
      { label: "Femenino", value: "Femenino" },
    ],
  },
  {
    name: "email",
    label: "Email",
    type: "text",
  },
  {
    name: "phone",
    label: "Teléfono",
    type: "text",
  },
  {
    name: "relationship",
    label: "Relación con el Estudiante",
    type: "select",
    placeholder: "Seleccione una relación",
    options: relationshipOptions,
  },
];
