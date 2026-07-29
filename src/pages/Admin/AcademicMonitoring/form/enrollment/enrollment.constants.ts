export const STEPS = [
  { title: "Datos Personales", description: "Nombre, cédula, fecha de nacimiento" },
  { title: "Datos Generales", description: "Lugar de nacimiento, dirección" },
  { title: "Representante", description: "Datos del representante legal" },
  { title: "Asignación", description: "Año escolar, nivel y sección" },
];

export const STEPS_REPITIENTE = [
  ...STEPS,
  { title: "Materias Aprobadas", description: "Materias aprobadas del año anterior" },
];

export const STEPS_PENDING = [
  ...STEPS,
  { title: "Materias Pendientes", description: "Materias reprobadas del año anterior" },
];

export const EDIT_STEPS = STEPS.filter((_, i) => i !== 2);
