import type { FormField } from "@/components/form/formComponent.interface";

export const step2Fields: FormField[] = [
  {
    name: "exchangeRate",
    label: "Tasa del Día (Bs./USD)",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
  },
  {
    name: "description",
    label: "Descripción",
    type: "text",
    placeholder: "Ej: Pago múltiple",
  },
  {
    name: "paymentDate",
    label: "Fecha de Pago",
    type: "date",
  },
];

export const step2ByName = Object.fromEntries(
  step2Fields.map((f) => [f.name, f]),
) as Record<string, FormField>;
