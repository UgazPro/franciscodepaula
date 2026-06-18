import type { FormField } from "@/components/form/formComponent.interface";

export const step2Fields: FormField[] = [
  {
    name: "representativeSearch",
    label: "Buscar Representante",
    type: "other",
  },
  {
    name: "payerName",
    label: "Nombre del Pagador",
    type: "text",
    placeholder: "Nombre y apellido",
  },
  {
    name: "payerIdentification",
    label: "Cédula del Pagador",
    type: "text",
    placeholder: "V-12345678",
  },
  {
    name: "payerPhone",
    label: "Teléfono del Pagador",
    type: "text",
    placeholder: "0412-1234567",
  },
  {
    name: "reference",
    label: "Referencia",
    type: "text",
    placeholder: "Número de referencia",
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