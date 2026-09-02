import type { FormField } from "@/components/form/formComponent.interface";

export const scholarshipFormFields: FormField[] = [
  {
    name: "amount",
    label: "Beca ($)",
    type: "text",
    inputType: "number",
    placeholder: "0.00",
  },
  {
    name: "startDate",
    label: "Fecha de Inicio",
    type: "date",
  },
  {
    name: "endDate",
    label: "Fecha de Fin (opcional)",
    type: "date",
  },
  {
    name: "reason",
    label: "Motivo",
    type: "textarea",
  },
];
