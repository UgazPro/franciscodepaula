import type { FormField } from "@/components/form/formComponent.interface";

export const feeFormFields: FormField[] = [
  {
    name: "name",
    label: "Concepto de Pago",
    type: "select",
    placeholder: "Seleccione tipo de pago",
    options: [
      { label: "Inscripción", value: "Inscripción" },
      { label: "Mensualidad", value: "Mensualidad" },
    ],
  },
  {
    name: "valueUSD",
    label: "Monto (USD)",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
  },
  {
    name: "valueVES",
    label: "Monto (VES)",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
  },
  {
    name: "startAt",
    label: "Fecha de Inicio",
    type: "date",
  },
  {
    name: "endAt",
    label: "Fecha de Fin",
    type: "date",
  },
];

export const feeFormByName = Object.fromEntries(
  feeFormFields.map((f) => [f.name, f]),
) as Record<string, FormField>;
