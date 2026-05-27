import type { FormField } from "@/components/form/formComponent.interface";

export const countries = [
  "Venezuela", "Colombia", "España", "Argentina",
  "México", "Perú", "Chile", "Ecuador",
];

export const states = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas",
  "Bolívar", "Carabobo", "Cojedes", "Delta Amacuro", "Falcón",
  "Guárico", "La Guaira", "Lara", "Mérida", "Miranda",
  "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira",
  "Trujillo", "Yaracuy", "Zulia", "Distrito Capital",
];

export const municipalities = [
  "Libertador", "Baruta", "Chacao", "El Hatillo", "Sucre",
  "Maracaibo", "San Francisco", "Cabimas", "Lagunillas",
  "Valencia", "Naguanagua", "San Diego", "Los Guayos",
  "Barquisimeto", "Iribarren", "Palavecino",
  "Maracay", "Girardot", "Turmero", "Las Tejerías",
  "Maturín", "Cumaná", "Barcelona", "Puerto La Cruz",
  "San Cristóbal", "Mérida", "Corps de la ciudad", "Alto Apure",
];

export const parishes = [
  "Altagracia", "Antímano", "Candelaria", "Caricuao",
  "Catedral", "Coche", "El Junquito", "El Paraíso",
  "El Recreo", "El Valle", "La Pastora", "La Vega",
  "Macarao", "San Agustín", "San Bernardino", "San José",
  "San Juan", "San Pedro", "Santa Rosalía", "Santa Teresa",
  "Sucre", "23 de Enero",
];

export const step2Fields: FormField[] = [
  {
    name: "birthCountry",
    label: "País de Nacimiento",
    type: "select",
    placeholder: "Seleccione un país",
    options: countries.map((c) => ({ label: c, value: c })),
  },
  {
    name: "state",
    label: "Estado de Nacimiento",
    type: "select",
    placeholder: "Seleccione un estado",
    options: states.map((s) => ({ label: s, value: s })),
  },
  {
    name: "municipality",
    label: "Municipio",
    type: "select",
    placeholder: "Seleccione un municipio",
    options: municipalities.map((m) => ({ label: m, value: m })),
  },
  {
    name: "parish",
    label: "Parroquia de Nacimiento",
    type: "select",
    placeholder: "Seleccione una parroquia",
    options: parishes.map((p) => ({ label: p, value: p })),
  },
  {
    name: "currentParish",
    label: "Parroquia donde Vive",
    type: "select",
    placeholder: "Seleccione una parroquia",
    options: parishes.map((p) => ({ label: p, value: p })),
  },
  {
    name: "previousSchool",
    label: "Escuela de Procedencia",
    type: "text",
    placeholder: "Ej: U.E. Colegio San José",
  },
  {
    name: "admissionDate",
    label: "Fecha de Admisión",
    type: "date",
  },
  {
    name: "address",
    label: "Dirección Completa",
    type: "textarea",
  },
];

export const step2ByName = Object.fromEntries(
  step2Fields.map((f) => [f.name, f])
) as Record<string, FormField>;
