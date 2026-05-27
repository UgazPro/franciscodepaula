import type { Personal, Estudiante, Representante, PagoRepresentante, Beca } from "./administration.types";

export const personalData: Personal[] = [
    { id: 1, cedula: "V-12345678", nombre: "María", apellido: "González", cargo: "Directora", departamento: "docente", fechaIngreso: "2015-08-15", salarioMensual: 1200, costoHora: 7.5, bonoProfesionalidad: 200, estatus: "activo", cuentaBancaria: "0102-1234-5678901234" },
    { id: 2, cedula: "V-87654321", nombre: "Carlos", apellido: "Méndez", cargo: "Profesor Matemáticas", departamento: "docente", fechaIngreso: "2018-03-10", salarioMensual: 850, costoHora: 5.31, bonoProfesionalidad: 100, estatus: "activo", cuentaBancaria: "0105-9876-5432109876" },
    { id: 3, cedula: "V-98765432", nombre: "Ana", apellido: "Rodríguez", cargo: "Secretaria", departamento: "administrativo", fechaIngreso: "2020-01-20", salarioMensual: 600, costoHora: 3.75, bonoProfesionalidad: 50, estatus: "activo", cuentaBancaria: "0108-4567-1234567890" },
    { id: 4, cedula: "V-54321678", nombre: "Luis", apellido: "Fernández", cargo: "Mantenimiento", departamento: "mantenimiento", fechaIngreso: "2019-06-15", salarioMensual: 500, costoHora: 3.13, bonoProfesionalidad: 0, estatus: "activo", cuentaBancaria: "0123-7890-4567890123" },
];

export const estudiantesData: Estudiante[] = [
    { id: 1, cedula: "V-12345678", nombre: "María", apellido: "González", grado: "3er Año", seccion: "A", representanteId: 1 },
    { id: 2, cedula: "V-87654321", nombre: "Carlos", apellido: "Méndez", grado: "4to Año", seccion: "B", representanteId: 1 },
    { id: 3, cedula: "V-98765432", nombre: "Sofía", apellido: "Rodríguez", grado: "2do Año", seccion: "A", representanteId: 2 },
    { id: 4, cedula: "V-54321678", nombre: "Luis", apellido: "Fernández", grado: "5to Año", seccion: "C", representanteId: 3 },
    { id: 5, cedula: "V-13579246", nombre: "Ana", apellido: "Martínez", grado: "3er Año", seccion: "B", representanteId: 2 },
];

export const representantesData: Representante[] = [
    { id: 1, cedula: "V-12345678", nombre: "Carlos", apellido: "González", telefono: "0412-1234567", email: "carlos.gonzalez@email.com", direccion: "Av. Principal, Casa 123" },
    { id: 2, cedula: "V-87654321", nombre: "Ana", apellido: "Méndez", telefono: "0416-7654321", email: "ana.mendez@email.com", direccion: "Calle 5, Qta 45" },
    { id: 3, cedula: "V-98765432", nombre: "Pedro", apellido: "Rodríguez", telefono: "0424-9876543", email: "pedro.rodriguez@email.com", direccion: "Urb. Las Flores, Casa 78" },
];

export const pagosData: PagoRepresentante[] = [
    { id: 1, estudianteId: 1, representanteId: 1, concepto: "Mensualidad Marzo", montoOriginal: 250, montoConBeca: 250, becaAplicada: 0, fechaEmision: "2024-03-01", fechaVencimiento: "2024-03-15", estado: "pagado", tipo: "mensualidad", metodoPago: "transferencia", referencia: "REF-001", facturaId: 1001 },
    { id: 2, estudianteId: 1, representanteId: 1, concepto: "Mensualidad Abril", montoOriginal: 250, montoConBeca: 125, becaAplicada: 50, fechaEmision: "2024-04-01", fechaVencimiento: "2024-04-15", estado: "pendiente", tipo: "mensualidad", facturaId: 1002 },
    { id: 3, estudianteId: 2, representanteId: 1, concepto: "Inscripción 2024", montoOriginal: 150, montoConBeca: 150, becaAplicada: 0, fechaEmision: "2024-01-10", fechaVencimiento: "2024-01-31", estado: "pagado", tipo: "inscripcion", metodoPago: "efectivo", referencia: "REF-002", facturaId: 1003 },
    { id: 4, estudianteId: 3, representanteId: 2, concepto: "Mensualidad Abril", montoOriginal: 250, montoConBeca: 0, becaAplicada: 100, fechaEmision: "2024-04-01", fechaVencimiento: "2024-04-15", estado: "vencido", tipo: "mensualidad", facturaId: 1004 },
];

export const becasData: Beca[] = [
    { id: 1, estudianteId: 1, tipo: "media", porcentaje: 50, motivo: "Excelencia académica", fechaInicio: "2024-01-01", activa: true, aprobadaPor: "Directora María González" },
    { id: 2, estudianteId: 3, tipo: "completa", porcentaje: 100, motivo: "Beca deportiva", fechaInicio: "2024-01-01", activa: true, aprobadaPor: "Directora María González" },
    { id: 3, estudianteId: 4, tipo: "parcial", porcentaje: 30, motivo: "Situación económica", fechaInicio: "2024-02-01", activa: true, aprobadaPor: "Coordinación" },
];

export function getDiasHabiles(fechaInicio: string, fechaFin: string): Date[] {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias: Date[] = [];

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay();
        if (diaSemana >= 1 && diaSemana <= 5) {
            dias.push(new Date(d));
        }
    }
    return dias;
}

export function generarRegistrosHoras(personalId: number, fechaInicio: string, fechaFin: string): import("./administration.types").RegistroHoras[] {
    const diasHabiles = getDiasHabiles(fechaInicio, fechaFin);

    return diasHabiles.map((dia, idx) => ({
        id: idx + 1,
        personalId,
        fecha: dia.toISOString().split('T')[0],
        diaSemana: dia.toLocaleDateString('es-ES', { weekday: 'long' }),
        horasTrabajadas: 8,
        tipo: idx % 10 === 0 ? "extra" : idx % 15 === 0 ? "bonificada" : "normal" as const,
        observaciones: idx % 10 === 0 ? "Horas extra por reunión" : undefined
    }));
}

export function getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getQuincenaDates(periodo: string, quincena: 1 | 2) {
    const [year, month] = periodo.split('-');
    const fechaInicio = quincena === 1
        ? `${year}-${month}-01`
        : `${year}-${month}-16`;
    const fechaFin = quincena === 1
        ? `${year}-${month}-15`
        : new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    return { fechaInicio, fechaFin };
}
