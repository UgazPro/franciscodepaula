import type { FormField } from "@/components/form/formComponent.interface";

export const relations = [
  "Padre", "Madre", "Representante Legal",
  "Tío(a)", "Abuelo(a)", "Hermano(a) Mayor", "Otro",
];

export const step3Fields: FormField[] = [
  {
    name: "representativeFirstNames",
    label: "Nombres",
    type: "text",
    placeholder: "Ej: Carlos José",
  },
  {
    name: "representativeLastNames",
    label: "Apellidos",
    type: "text",
    placeholder: "Ej: González Rodríguez",
  },
  {
    name: "representativeIdentification",
    label: "Cédula",
    type: "text",
    placeholder: "Ej: V-87654321",
  },
  {
    name: "representativeBirthDate",
    label: "Fecha de Nacimiento",
    type: "date",
  },
  {
    name: "representativeGender",
    label: "Género",
    type: "select",
    placeholder: "Seleccione un género",
    options: [
      { label: "Masculino", value: "Masculino" },
      { label: "Femenino", value: "Femenino" },
    ],
  },
  {
    name: "representativeEmail",
    label: "Email",
    type: "text",
    inputType: "email",
    placeholder: "Ej: correo@ejemplo.com",
  },
  {
    name: "representativePhone",
    label: "Teléfono",
    type: "text",
    placeholder: "Ej: 0412-1234567",
  },
  {
    name: "representativeRelation",
    label: "Relación con el Estudiante",
    type: "select",
    placeholder: "Seleccione una relación",
    options: relations.map((r) => ({ label: r, value: r })),
  },
  {
    name: "representativeProfession",
    label: "Profesión",
    type: "text",
    placeholder: "Ej: Ingeniero, Docente, Comerciante",
  },
];

export const step3ByName = Object.fromEntries(
  step3Fields.map((f) => [f.name, f])
) as Record<string, FormField>;
