import type { FormField } from "@/components/form/formComponent.interface";

export const employeeFields: FormField[] = [
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
    name: "roleId",
    label: "Rol",
    type: "select",
    placeholder: "Seleccione un rol",
    options: [],
  },
  {
    name: "hireDate",
    label: "Fecha de Contratación",
    type: "date",
  },
];

export const employeeFieldsByName = Object.fromEntries(
  employeeFields.map((f) => [f.name, f])
);
