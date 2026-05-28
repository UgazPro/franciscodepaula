import type { FormField } from "@/components/form/formComponent.interface";

export const step1Fields: FormField[] = [
  {
    name: "studentSearch",
    label: "Buscar Estudiante",
    type: "other",
  },
  {
    name: "chargeTypeId",
    label: "Tipo de Deuda",
    type: "select",
    placeholder: "Seleccione tipo de deuda",
    options: [],
  },
  {
    name: "totalAmount",
    label: "Monto",
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
    name: "paymentMethodId",
    label: "Método de Pago",
    type: "select",
    placeholder: "Seleccione método de pago",
    options: [],
  },
  {
    name: "description",
    label: "Descripción",
    type: "text",
    placeholder: "Ej: Mensualidad Abril 2026",
  },
  {
    name: "paymentDate",
    label: "Fecha de Pago",
    type: "date",
  },
];

export const step1ByName = Object.fromEntries(
  step1Fields.map((f) => [f.name, f]),
) as Record<string, FormField>;
