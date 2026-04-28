import type { FormField } from "@/components/form/formComponent.interface";

export const studentLeftFields: FormField[] = [
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
      { label: "Masculino", value: "male" },
      { label: "Femenino", value: "female" },
    ],
  },
];

export const studentMiddleFields: FormField[] = [
  {
    name: "birthCountry",
    label: "País de Nacimiento",
    type: "text",
  },
  {
    name: "state",
    label: "Estado",
    type: "text",
  },
  {
    name: "parish",
    label: "Parroquia",
    type: "text",
  },
  {
    name: "address",
    label: "Dirección",
    type: "textarea",
  },
];

export const studentRightFields: FormField[] = [
  {
    name: "admissionDate",
    label: "Fecha de Admisión",
    type: "date",
  },
  // {
  //   name: "sectionId",
  //   label: "Sección",
  //   type: "select",
  //   placeholder: "Seleccione una sección",
  //   options: [],
  // },
  {
    name: "previousSchool",
    label: "Escuela Previa",
    type: "text",
  },
  { type: "other", name: "profileImg", label: "Foto del Estudiante" },
];
