export interface Personal {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    cargo: string;
    departamento: "docente" | "administrativo" | "mantenimiento";
    fechaIngreso: string;
    salarioMensual: number;
    costoHora: number;
    bonoProfesionalidad: number;
    estatus: "activo" | "inactivo" | "vacaciones";
    cuentaBancaria: string;
}

export interface RegistroHoras {
    id: number;
    personalId: number;
    fecha: string;
    diaSemana: string;
    horasTrabajadas: number;
    tipo: "normal" | "extra" | "bonificada";
    observaciones?: string;
}

export interface Nomina {
    id: number;
    personalId: number;
    periodo: string;
    quincena: 1 | 2;
    fechaInicio: string;
    fechaFin: string;
    totalHorasNormales: number;
    totalHorasExtra: number;
    totalHorasBonificadas: number;
    salarioBase: number;
    bonoProfesionalidad: number;
    horasExtraTotal: number;
    totalDevengado: number;
    deduccionesTotal: number;
    salarioNeto: number;
    pagado: boolean;
    fechaPago?: string;
}

export interface Representante {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    direccion: string;
}

export interface Estudiante {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    grado: string;
    seccion: string;
    representanteId: number;
}

export interface PagoRepresentante {
    id: number;
    estudianteId: number;
    representanteId: number;
    concepto: string;
    montoOriginal: number;
    montoConBeca: number;
    becaAplicada: number;
    fechaEmision: string;
    fechaVencimiento: string;
    fechaPago?: string;
    estado: "pendiente" | "pagado" | "vencido" | "anulado";
    tipo: "mensualidad" | "inscripcion" | "actividad" | "otros";
    metodoPago?: "efectivo" | "transferencia" | "punto" | "zelle";
    referencia?: string;
    facturaId: number;
}

export interface Beca {
    id: number;
    estudianteId: number;
    tipo: "completa" | "media" | "parcial";
    porcentaje: number;
    motivo: string;
    fechaInicio: string;
    fechaFin?: string;
    activa: boolean;
    aprobadaPor: string;
}

export interface TasaDolar {
    valor: number;
    fecha: string;
    fuente: string;
    variacion: number;
}

export type AdminTab = "dashboard" | "nominas" | "pagos" | "becas" | "estudiantes";
