import type { FormField } from "@/components/form/formComponent.interface";

export const step1Fields: FormField[] = [
  {
    name: "exchangeRate",
    label: "Tasa del Día (Bs./USD)",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
  },
  {
    name: "currency",
    label: "Moneda",
    type: "select",
    placeholder: "Seleccione moneda",
    options: [
      { label: "Bolívares (Bs.)", value: "VES" },
      { label: "Dólares ($)", value: "USD" },
    ],
  },
  {
    name: "expectedUsd",
    label: "Total Esperado en USD",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
    disabled: true,
  },
  {
    name: "expectedVes",
    label: "Total Esperado en Bs.",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
    disabled: true,
  },
  {
    name: "totalAmount",
    label: "Monto a Pagar",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
  },
  {
    name: "studentsSection",
    label: "Estudiantes",
    type: "other",
  },
];

export const step1ByName = Object.fromEntries(
  step1Fields.map((f) => [f.name, f]),
) as Record<string, FormField>;