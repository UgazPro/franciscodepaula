import { useState, useEffect, useMemo } from "react";
import {
    DollarSign,
    Users,
    CreditCard,
    Receipt,
    Calendar,
    Clock,
    TrendingUp,
    Download,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    Eye,
    X,
    CheckCircle,
    AlertCircle,
    Award,
    Building2,
    UserCheck,
    FileText,
    Printer,
    RefreshCw,
    Wallet,
    Percent,
    BarChart3,
    PieChart,
    Briefcase,
    Home,
    TrendingDown,
    UserPlus,
    BookOpen,
    GraduationCap
} from "lucide-react";

// ==================== TIPOS ====================

interface Personal {
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

interface RegistroHoras {
    id: number;
    personalId: number;
    fecha: string;
    diaSemana: string;
    horasTrabajadas: number;
    tipo: "normal" | "extra" | "bonificada";
    observaciones?: string;
}

interface Nomina {
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

interface Representante {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    direccion: string;
}

interface Estudiante {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    grado: string;
    seccion: string;
    representanteId: number;
}

interface PagoRepresentante {
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

interface Beca {
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

interface TasaDolar {
    valor: number;
    fecha: string;
    fuente: string;
    variacion: number;
}

// ==================== DATOS DE EJEMPLO ====================

const personalData: Personal[] = [
    { id: 1, cedula: "V-12345678", nombre: "María", apellido: "González", cargo: "Directora", departamento: "docente", fechaIngreso: "2015-08-15", salarioMensual: 1200, costoHora: 7.5, bonoProfesionalidad: 200, estatus: "activo", cuentaBancaria: "0102-1234-5678901234" },
    { id: 2, cedula: "V-87654321", nombre: "Carlos", apellido: "Méndez", cargo: "Profesor Matemáticas", departamento: "docente", fechaIngreso: "2018-03-10", salarioMensual: 850, costoHora: 5.31, bonoProfesionalidad: 100, estatus: "activo", cuentaBancaria: "0105-9876-5432109876" },
    { id: 3, cedula: "V-98765432", nombre: "Ana", apellido: "Rodríguez", cargo: "Secretaria", departamento: "administrativo", fechaIngreso: "2020-01-20", salarioMensual: 600, costoHora: 3.75, bonoProfesionalidad: 50, estatus: "activo", cuentaBancaria: "0108-4567-1234567890" },
    { id: 4, cedula: "V-54321678", nombre: "Luis", apellido: "Fernández", cargo: "Mantenimiento", departamento: "mantenimiento", fechaIngreso: "2019-06-15", salarioMensual: 500, costoHora: 3.13, bonoProfesionalidad: 0, estatus: "activo", cuentaBancaria: "0123-7890-4567890123" },
];

const estudiantesData: Estudiante[] = [
    { id: 1, cedula: "V-12345678", nombre: "María", apellido: "González", grado: "3er Año", seccion: "A", representanteId: 1 },
    { id: 2, cedula: "V-87654321", nombre: "Carlos", apellido: "Méndez", grado: "4to Año", seccion: "B", representanteId: 1 },
    { id: 3, cedula: "V-98765432", nombre: "Sofía", apellido: "Rodríguez", grado: "2do Año", seccion: "A", representanteId: 2 },
    { id: 4, cedula: "V-54321678", nombre: "Luis", apellido: "Fernández", grado: "5to Año", seccion: "C", representanteId: 3 },
    { id: 5, cedula: "V-13579246", nombre: "Ana", apellido: "Martínez", grado: "3er Año", seccion: "B", representanteId: 2 },
];

const representantesData: Representante[] = [
    { id: 1, cedula: "V-12345678", nombre: "Carlos", apellido: "González", telefono: "0412-1234567", email: "carlos.gonzalez@email.com", direccion: "Av. Principal, Casa 123" },
    { id: 2, cedula: "V-87654321", nombre: "Ana", apellido: "Méndez", telefono: "0416-7654321", email: "ana.mendez@email.com", direccion: "Calle 5, Qta 45" },
    { id: 3, cedula: "V-98765432", nombre: "Pedro", apellido: "Rodríguez", telefono: "0424-9876543", email: "pedro.rodriguez@email.com", direccion: "Urb. Las Flores, Casa 78" },
];

const pagosData: PagoRepresentante[] = [
    { id: 1, estudianteId: 1, representanteId: 1, concepto: "Mensualidad Marzo", montoOriginal: 250, montoConBeca: 250, becaAplicada: 0, fechaEmision: "2024-03-01", fechaVencimiento: "2024-03-15", estado: "pagado", tipo: "mensualidad", metodoPago: "transferencia", referencia: "REF-001", facturaId: 1001 },
    { id: 2, estudianteId: 1, representanteId: 1, concepto: "Mensualidad Abril", montoOriginal: 250, montoConBeca: 125, becaAplicada: 50, fechaEmision: "2024-04-01", fechaVencimiento: "2024-04-15", estado: "pendiente", tipo: "mensualidad", facturaId: 1002 },
    { id: 3, estudianteId: 2, representanteId: 1, concepto: "Inscripción 2024", montoOriginal: 150, montoConBeca: 150, becaAplicada: 0, fechaEmision: "2024-01-10", fechaVencimiento: "2024-01-31", estado: "pagado", tipo: "inscripcion", metodoPago: "efectivo", referencia: "REF-002", facturaId: 1003 },
    { id: 4, estudianteId: 3, representanteId: 2, concepto: "Mensualidad Abril", montoOriginal: 250, montoConBeca: 0, becaAplicada: 100, fechaEmision: "2024-04-01", fechaVencimiento: "2024-04-15", estado: "vencido", tipo: "mensualidad", facturaId: 1004 },
];

const becasData: Beca[] = [
    { id: 1, estudianteId: 1, tipo: "media", porcentaje: 50, motivo: "Excelencia académica", fechaInicio: "2024-01-01", activa: true, aprobadaPor: "Directora María González" },
    { id: 2, estudianteId: 3, tipo: "completa", porcentaje: 100, motivo: "Beca deportiva", fechaInicio: "2024-01-01", activa: true, aprobadaPor: "Directora María González" },
    { id: 3, estudianteId: 4, tipo: "parcial", porcentaje: 30, motivo: "Situación económica", fechaInicio: "2024-02-01", activa: true, aprobadaPor: "Coordinación" },
];

// Función para obtener días hábiles entre dos fechas (lunes a viernes)
const getDiasHabiles = (fechaInicio: string, fechaFin: string): Date[] => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias: Date[] = [];

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay();
        if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
            dias.push(new Date(d));
        }
    }
    return dias;
};

// Generar registros de horas para un empleado en un período
const generarRegistrosHoras = (personalId: number, fechaInicio: string, fechaFin: string): RegistroHoras[] => {
    const diasHabiles = getDiasHabiles(fechaInicio, fechaFin);
    const personal = personalData.find(p => p.id === personalId);
    const horasPorDia = 8; // Jornada laboral estándar

    return diasHabiles.map((dia, idx) => ({
        id: idx + 1,
        personalId,
        fecha: dia.toISOString().split('T')[0],
        diaSemana: dia.toLocaleDateString('es-ES', { weekday: 'long' }),
        horasTrabajadas: horasPorDia,
        tipo: idx % 10 === 0 ? "extra" : idx % 15 === 0 ? "bonificada" : "normal",
        observaciones: idx % 10 === 0 ? "Horas extra por reunión" : undefined
    }));
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function Administracion() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "nominas" | "pagos" | "becas">("dashboard");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [showReciboModal, setShowReciboModal] = useState(false);
    const [showHorasDetalleModal, setShowHorasDetalleModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [selectedPersonal, setSelectedPersonal] = useState<Personal | null>(null);
    const [selectedPeriodo, setSelectedPeriodo] = useState(getCurrentPeriod());

    // Estados para datos
    const [personal] = useState<Personal[]>(personalData);
    const [nominas, setNominas] = useState<Nomina[]>([]);
    const [registrosHoras, setRegistrosHoras] = useState<RegistroHoras[]>([]);
    const [pagos, setPagos] = useState<PagoRepresentante[]>(pagosData);
    const [becas, setBecas] = useState<Beca[]>(becasData);
    const [estudiantes] = useState<Estudiante[]>(estudiantesData);
    const [representantes] = useState<Representante[]>(representantesData);

    // Estado para la tasa del dólar
    const [tasaDolar, setTasaDolar] = useState<TasaDolar>({
        valor: 42.15,
        fecha: new Date().toISOString().split('T')[0],
        fuente: "BCV",
        variacion: 2.3
    });

    // Formularios
    const [formPago, setFormPago] = useState<Partial<PagoRepresentante>>({
        concepto: "", montoOriginal: 0, fechaEmision: "", fechaVencimiento: "", tipo: "mensualidad", metodoPago: "transferencia"
    });

    const [formBeca, setFormBeca] = useState<Partial<Beca>>({
        estudianteId: 0, tipo: "media", porcentaje: 50, motivo: "", fechaInicio: "", activa: true, aprobadaPor: ""
    });

    function getCurrentPeriod() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // Obtener fechas de quincena
    const getQuincenaDates = (periodo: string, quincena: 1 | 2) => {
        const [year, month] = periodo.split('-');
        const fechaInicio = quincena === 1
            ? `${year}-${month}-01`
            : `${year}-${month}-16`;
        const fechaFin = quincena === 1
            ? `${year}-${month}-15`
            : new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
        return { fechaInicio, fechaFin };
    };

    // Generar nóminas automáticamente
    useEffect(() => {
        const generarNominas = () => {
            const nuevasNominas: Nomina[] = [];
            const [year, month] = selectedPeriodo.split('-');

            // Procesar quincena 1 (días 1-15)
            const quincena1Dates = getQuincenaDates(selectedPeriodo, 1);
            const diasHabilesQuincena1 = getDiasHabiles(quincena1Dates.fechaInicio, quincena1Dates.fechaFin);
            const totalHorasQuincena1 = diasHabilesQuincena1.length * 8;

            // Procesar quincena 2 (días 16-fin)
            const quincena2Dates = getQuincenaDates(selectedPeriodo, 2);
            const diasHabilesQuincena2 = getDiasHabiles(quincena2Dates.fechaInicio, quincena2Dates.fechaFin);
            const totalHorasQuincena2 = diasHabilesQuincena2.length * 8;

            personal.filter(p => p.estatus === "activo").forEach(person => {
                // Generar registros de horas para el período completo
                const registros = [
                    ...generarRegistrosHoras(person.id, quincena1Dates.fechaInicio, quincena1Dates.fechaFin),
                    ...generarRegistrosHoras(person.id, quincena2Dates.fechaInicio, quincena2Dates.fechaFin)
                ];
                setRegistrosHoras(prev => [...prev, ...registros]);

                const horasNormalesQuincena1 = totalHorasQuincena1;
                const horasNormalesQuincena2 = totalHorasQuincena2;
                const totalHorasNormales = horasNormalesQuincena1 + horasNormalesQuincena2;

                // Cálculo del salario basado en horas trabajadas
                const salarioBaseCalculado = totalHorasNormales * person.costoHora;
                const horasExtraTotal = 0; // Se calcularía de registros tipo "extra"
                const totalDevengado = salarioBaseCalculado + person.bonoProfesionalidad;
                const deduccionesTotal = totalDevengado * 0.095; // 9.5% aproximado de deducciones
                const salarioNeto = totalDevengado - deduccionesTotal;

                // Nómina Quincena 1
                nuevasNominas.push({
                    id: nuevasNominas.length + 1,
                    personalId: person.id,
                    periodo: selectedPeriodo,
                    quincena: 1,
                    fechaInicio: quincena1Dates.fechaInicio,
                    fechaFin: quincena1Dates.fechaFin,
                    totalHorasNormales: horasNormalesQuincena1,
                    totalHorasExtra: 0,
                    totalHorasBonificadas: 0,
                    salarioBase: salarioBaseCalculado / 2,
                    bonoProfesionalidad: person.bonoProfesionalidad / 2,
                    horasExtraTotal: 0,
                    totalDevengado: (salarioBaseCalculado / 2) + (person.bonoProfesionalidad / 2),
                    deduccionesTotal: (salarioBaseCalculado / 2) * 0.095,
                    salarioNeto: ((salarioBaseCalculado / 2) + (person.bonoProfesionalidad / 2)) - ((salarioBaseCalculado / 2) * 0.095),
                    pagado: false,
                });

                // Nómina Quincena 2
                nuevasNominas.push({
                    id: nuevasNominas.length + 1,
                    personalId: person.id,
                    periodo: selectedPeriodo,
                    quincena: 2,
                    fechaInicio: quincena2Dates.fechaInicio,
                    fechaFin: quincena2Dates.fechaFin,
                    totalHorasNormales: horasNormalesQuincena2,
                    totalHorasExtra: 0,
                    totalHorasBonificadas: 0,
                    salarioBase: salarioBaseCalculado / 2,
                    bonoProfesionalidad: person.bonoProfesionalidad / 2,
                    horasExtraTotal: 0,
                    totalDevengado: (salarioBaseCalculado / 2) + (person.bonoProfesionalidad / 2),
                    deduccionesTotal: (salarioBaseCalculado / 2) * 0.095,
                    salarioNeto: ((salarioBaseCalculado / 2) + (person.bonoProfesionalidad / 2)) - ((salarioBaseCalculado / 2) * 0.095),
                    pagado: false,
                });
            });

            setNominas(nuevasNominas);
        };

        generarNominas();
    }, [selectedPeriodo, personal]);

    // Filtrar datos
    const filteredData = useMemo(() => {
        if (activeTab === "nominas") {
            return nominas.filter(n => {
                const person = personal.find(p => p.id === n.personalId);
                return person?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    person?.apellido.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        if (activeTab === "pagos") {
            return pagos.filter(p => {
                const estudiante = estudiantes.find(e => e.id === p.estudianteId);
                return p.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    estudiante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.estado.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        return becas.filter(b => {
            const estudiante = estudiantes.find(e => e.id === b.estudianteId);
            return estudiante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.tipo.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [activeTab, nominas, pagos, becas, personal, estudiantes, searchTerm]);

    // Paginación
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    // Calcular totales
    const calcularTotalesNominas = () => {
        const totalDevengado = nominas.reduce((sum, n) => sum + n.totalDevengado, 0);
        const totalDeducciones = nominas.reduce((sum, n) => sum + n.deduccionesTotal, 0);
        const totalNeto = nominas.reduce((sum, n) => sum + n.salarioNeto, 0);
        const pagadoTotal = nominas.filter(n => n.pagado).reduce((sum, n) => sum + n.salarioNeto, 0);
        return { totalDevengado, totalDeducciones, totalNeto, pagadoTotal };
    };

    const calcularTotalesPagos = () => {
        const totalPendiente = pagos.filter(p => p.estado === "pendiente").reduce((sum, p) => sum + p.montoConBeca, 0);
        const totalPagado = pagos.filter(p => p.estado === "pagado").reduce((sum, p) => sum + p.montoConBeca, 0);
        const totalVencido = pagos.filter(p => p.estado === "vencido").reduce((sum, p) => sum + p.montoConBeca, 0);
        const totalConBecas = pagos.reduce((sum, p) => sum + (p.montoOriginal - p.montoConBeca), 0);
        return { totalPendiente, totalPagado, totalVencido, totalConBecas };
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "pagado": return "bg-green-100 text-green-700";
            case "pendiente": return "bg-yellow-100 text-yellow-700";
            case "vencido": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const handleRegistrarPago = (pagoId: number) => {
        setPagos(pagos.map(p =>
            p.id === pagoId
                ? { ...p, estado: "pagado", fechaPago: new Date().toISOString().split('T')[0] }
                : p
        ));
    };

    const actualizarTasaDolar = () => {
        const nuevaTasa = 42.15 + (Math.random() * 2 - 1);
        setTasaDolar({
            valor: parseFloat(nuevaTasa.toFixed(2)),
            fecha: new Date().toISOString().split('T')[0],
            fuente: "BCV",
            variacion: parseFloat((Math.random() * 5 - 2.5).toFixed(1))
        });
    };

    const handleVerDetalleHoras = (personalId: number, quincena: 1 | 2) => {
        const person = personal.find(p => p.id === personalId);
        const nomina = nominas.find(n => n.personalId === personalId && n.quincena === quincena);
        if (person && nomina) {
            setSelectedPersonal(person);
            setSelectedItem({ ...nomina, personal: person });
            setShowHorasDetalleModal(true);
        }
    };

    // Obtener registros de horas para un empleado en un rango de fechas
    const getRegistrosHorasPorRango = (personalId: number, fechaInicio: string, fechaFin: string) => {
        return registrosHoras.filter(r =>
            r.personalId === personalId &&
            r.fecha >= fechaInicio &&
            r.fecha <= fechaFin
        );
    };

    // Estadísticas para Dashboard
    const estudiantesActivos = estudiantes.length;
    const personalActivo = personal.filter(p => p.estatus === "activo").length;
    const ingresosMes = pagos.filter(p => p.estado === "pagado").reduce((sum, p) => sum + p.montoConBeca, 0);
    const egresosMes = nominas.filter(n => n.pagado).reduce((sum, n) => sum + n.salarioNeto, 0);
    const balanceMes = ingresosMes - egresosMes;
    const morosidad = (pagos.filter(p => p.estado === "pendiente" || p.estado === "vencido").reduce((sum, p) => sum + p.montoConBeca, 0) / ingresosMes) * 100;

    return (
        <div className="space-y-6">
            {/* Header con Tasa del Dólar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200">
                    {[
                        { id: "dashboard", label: "Dashboard", icon: Home },
                        { id: "nominas", label: "Nóminas", icon: Briefcase },
                        { id: "pagos", label: "Pagos", icon: CreditCard },
                        { id: "becas", label: "Becas", icon: Award },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition ${activeTab === tab.id
                                    ? "bg-white text-blue-900 border-b-2 border-green-500"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tarjeta de Tasa del Dólar */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <DollarSign size={28} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-xs uppercase tracking-wide">Tasa del Dólar (BCV)</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-white">Bs. {tasaDolar.valor.toFixed(2)}</span>
                                <button onClick={actualizarTasaDolar} className="p-1 hover:bg-white/20 rounded-lg transition">
                                    <RefreshCw size={14} className="text-blue-200" />
                                </button>
                            </div>
                            <p className="text-blue-200 text-xs">Actualizado: {tasaDolar.fecha}</p>
                        </div>
                        <div className="border-l border-white/20 pl-3">
                            <div className={`flex items-center gap-1 ${tasaDolar.variacion >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {tasaDolar.variacion >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                <span className="text-sm font-semibold">{Math.abs(tasaDolar.variacion)}%</span>
                            </div>
                            <p className="text-white text-xs">vs ayer</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== DASHBOARD ==================== */}
            {activeTab === "dashboard" && (
                <div className="space-y-6">
                    {/* Tarjetas principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <DashboardCard title="Estudiantes" value={estudiantesActivos} icon={GraduationCap} color="blue" subtitle="Activos" />
                        <DashboardCard title="Personal" value={personalActivo} icon={Users} color="green" subtitle="En servicio" />
                        <DashboardCard title="Ingresos del Mes" value={`Bs. ${ingresosMes.toFixed(2)}`} icon={TrendingUp} color="green" subtitle="+12% vs mes anterior" />
                        <DashboardCard title="Egresos del Mes" value={`Bs. ${egresosMes.toFixed(2)}`} icon={TrendingDown} color="red" subtitle="Nóminas + gastos" />
                    </div>

                    {/* Segunda fila */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <DashboardCard title="Balance del Mes" value={`Bs. ${balanceMes.toFixed(2)}`} icon={Wallet} color={balanceMes >= 0 ? "green" : "red"} subtitle={balanceMes >= 0 ? "Superávit" : "Déficit"} />
                        <DashboardCard title="Morosidad" value={`${morosidad.toFixed(1)}%`} icon={AlertCircle} color="yellow" subtitle="Pagos pendientes" />
                        <DashboardCard title="Becas Activas" value={becas.filter(b => b.activa).length} icon={Award} color="blue" subtitle="Estudiantes beneficiados" />
                    </div>

                    {/* Gráficos de resumen */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Distribución de pagos */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <PieChart size={20} className="text-green-500" />
                                Estado de Pagos
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Pagado</span>
                                        <span className="font-medium">Bs. {calcularTotalesPagos().totalPagado.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(calcularTotalesPagos().totalPagado / (calcularTotalesPagos().totalPagado + calcularTotalesPagos().totalPendiente + calcularTotalesPagos().totalVencido)) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Pendiente</span>
                                        <span className="font-medium">Bs. {calcularTotalesPagos().totalPendiente.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(calcularTotalesPagos().totalPendiente / (calcularTotalesPagos().totalPagado + calcularTotalesPagos().totalPendiente + calcularTotalesPagos().totalVencido)) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Vencido</span>
                                        <span className="font-medium">Bs. {calcularTotalesPagos().totalVencido.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(calcularTotalesPagos().totalVencido / (calcularTotalesPagos().totalPagado + calcularTotalesPagos().totalPendiente + calcularTotalesPagos().totalVencido)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Distribución de personal */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <Users size={20} className="text-green-500" />
                                Distribución del Personal
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Docentes</span>
                                        <span className="font-medium">{personal.filter(p => p.departamento === "docente").length}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-900 h-2 rounded-full" style={{ width: `${(personal.filter(p => p.departamento === "docente").length / personal.length) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Administrativos</span>
                                        <span className="font-medium">{personal.filter(p => p.departamento === "administrativo").length}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(personal.filter(p => p.departamento === "administrativo").length / personal.length) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Mantenimiento</span>
                                        <span className="font-medium">{personal.filter(p => p.departamento === "mantenimiento").length}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(personal.filter(p => p.departamento === "mantenimiento").length / personal.length) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Próximos vencimientos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                <Calendar size={20} className="text-green-500" />
                                Próximos Vencimientos
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {pagos.filter(p => p.estado === "pendiente").slice(0, 5).map(pago => {
                                const estudiante = estudiantes.find(e => e.id === pago.estudianteId);
                                return (
                                    <div key={pago.id} className="px-6 py-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">{estudiante?.nombre} {estudiante?.apellido}</p>
                                            <p className="text-sm text-gray-500">{pago.concepto}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">Bs. {pago.montoConBeca.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">Vence: {pago.fechaVencimiento}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {pagos.filter(p => p.estado === "pendiente").length === 0 && (
                                <div className="px-6 py-8 text-center text-gray-400">
                                    No hay pagos pendientes próximos a vencer
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== TABLA DE NÓMINAS ==================== */}
            {activeTab === "nominas" && (
                <div className="space-y-4">
                    {/* Filtros */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por personal..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="month"
                                    value={selectedPeriodo}
                                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                                />
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition">
                                    <Download size={18} />
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas de resumen */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="Total Devengado" value={`Bs. ${calcularTotalesNominas().totalDevengado.toFixed(2)}`} icon={TrendingUp} color="blue" />
                        <SummaryCard title="Total Deducciones" value={`Bs. ${calcularTotalesNominas().totalDeducciones.toFixed(2)}`} icon={AlertCircle} color="red" />
                        <SummaryCard title="Total Neto" value={`Bs. ${calcularTotalesNominas().totalNeto.toFixed(2)}`} icon={CheckCircle} color="green" />
                        <SummaryCard title="Pagado" value={`Bs. ${calcularTotalesNominas().pagadoTotal.toFixed(2)}`} icon={Wallet} color="green" />
                    </div>

                    {/* Tabla de Nóminas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Personal</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quincena</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horas Trabajadas</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Costo Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Salario Base</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bonificación</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Neto</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.map((nom: any) => {
                                        const person = personal.find(p => p.id === nom.personalId);
                                        return (
                                            <tr key={nom.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {person?.nombre.charAt(0)}{person?.apellido.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{person?.nombre} {person?.apellido}</p>
                                                            <p className="text-xs text-gray-400">{person?.cargo}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <p className="font-medium">{nom.quincena === 1 ? "1ra Quincena" : "2da Quincena"}</p>
                                                        <p className="text-xs text-gray-400">{nom.fechaInicio} al {nom.fechaFin}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleVerDetalleHoras(nom.personalId, nom.quincena)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                    >
                                                        {nom.totalHorasNormales} hrs
                                                        <Eye size={14} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">Bs. {person?.costoHora.toFixed(2)}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800">Bs. {nom.salarioBase.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-green-600">Bs. {nom.bonoProfesionalidad.toFixed(2)}</td>
                                                <td className="px-6 py-4 font-bold text-blue-900">Bs. {nom.salarioNeto.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                            <Printer size={16} />
                                                        </button>
                                                        {!nom.pagado && (
                                                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} />
                    </div>
                </div>
            )}

            {/* Tabla de Pagos */}
            {activeTab === "pagos" && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por estudiante o concepto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <button
                                onClick={() => { setEditingItem(null); setShowPagoModal(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md"
                            >
                                <Plus size={18} />
                                Registrar Pago
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="Pendiente" value={`Bs. ${calcularTotalesPagos().totalPendiente.toFixed(2)}`} icon={Clock} color="yellow" />
                        <SummaryCard title="Pagado" value={`Bs. ${calcularTotalesPagos().totalPagado.toFixed(2)}`} icon={CheckCircle} color="green" />
                        <SummaryCard title="Vencido" value={`Bs. ${calcularTotalesPagos().totalVencido.toFixed(2)}`} icon={AlertCircle} color="red" />
                        <SummaryCard title="Ahorro por Becas" value={`Bs. ${calcularTotalesPagos().totalConBecas.toFixed(2)}`} icon={Award} color="blue" />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Concepto</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto Original</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Con Beca</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vencimiento</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.map((pago: any) => {
                                        const estudiante = estudiantes.find(e => e.id === pago.estudianteId);
                                        const becaAplicada = becas.find(b => b.estudianteId === pago.estudianteId && b.activa);
                                        return (
                                            <tr key={pago.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800">{estudiante?.nombre} {estudiante?.apellido}</p>
                                                    <p className="text-xs text-gray-400">{estudiante?.grado} - {estudiante?.seccion}</p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{pago.concepto}</td>
                                                <td className="px-6 py-4 text-gray-500 line-through">Bs. {pago.montoOriginal.toFixed(2)}</td>
                                                <td className="px-6 py-4 font-bold text-green-600">Bs. {pago.montoConBeca.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-gray-600">{pago.fechaVencimiento}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pago.estado)}`}>
                                                        {pago.estado === "pagado" ? "Pagado" : pago.estado === "pendiente" ? "Pendiente" : "Vencido"}
                                                    </span>
                                                    {becaAplicada && pago.becaAplicada > 0 && (
                                                        <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                                                            <Award size={10} /> {becaAplicada.porcentaje}% beca
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => { setSelectedItem(pago); setShowReciboModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Receipt size={16} />
                                                        </button>
                                                        {pago.estado === "pendiente" && (
                                                            <button onClick={() => handleRegistrarPago(pago.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} />
                    </div>
                </div>
            )}

            {/* Tabla de Becas */}
            {activeTab === "becas" && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por estudiante..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <button
                                onClick={() => { setEditingItem(null); setShowModal(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md"
                            >
                                <Plus size={18} />
                                Asignar Beca
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo de Beca</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Porcentaje</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Motivo</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Inicio</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aprobada por</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.map((beca: any) => {
                                        const estudiante = estudiantes.find(e => e.id === beca.estudianteId);
                                        return (
                                            <tr key={beca.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800">{estudiante?.nombre} {estudiante?.apellido}</p>
                                                    <p className="text-xs text-gray-400">{estudiante?.grado} - {estudiante?.seccion}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${beca.tipo === "completa" ? "bg-green-100 text-green-700" :
                                                            beca.tipo === "media" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                        {beca.tipo === "completa" ? "Beca Completa" : beca.tipo === "media" ? "Beca Media" : "Beca Parcial"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-blue-900">{beca.porcentaje}%</td>
                                                <td className="px-6 py-4 text-gray-600">{beca.motivo}</td>
                                                <td className="px-6 py-4 text-gray-600">{beca.fechaInicio}</td>
                                                <td className="px-6 py-4 text-gray-600">{beca.aprobadaPor}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${beca.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                                        {beca.activa ? "Activa" : "Inactiva"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => { setEditingItem(beca); setFormBeca(beca); setShowModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => { setSelectedItem(beca); setShowDeleteModal(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} />
                    </div>
                </div>
            )}

            {/* ==================== MODALES ==================== */}

            {/* Modal de Detalle de Horas */}
            {showHorasDetalleModal && selectedPersonal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-blue-900">Detalle de Horas Trabajadas</h2>
                                <p className="text-sm text-gray-500">{selectedPersonal.nombre} {selectedPersonal.apellido} - {selectedItem.quincena === 1 ? "1ra Quincena" : "2da Quincena"} {selectedItem.periodo}</p>
                            </div>
                            <button onClick={() => setShowHorasDetalleModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Total Horas</p>
                                    <p className="text-2xl font-bold text-blue-900">{selectedItem.totalHorasNormales}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Costo por Hora</p>
                                    <p className="text-2xl font-bold text-green-600">Bs. {selectedPersonal.costoHora.toFixed(2)}</p>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-3">Registro por día</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Fecha</th>
                                            <th className="px-4 py-2 text-left">Día</th>
                                            <th className="px-4 py-2 text-left">Horas</th>
                                            <th className="px-4 py-2 text-left">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getRegistrosHorasPorRango(selectedPersonal.id, selectedItem.fechaInicio, selectedItem.fechaFin).map((registro, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2">{registro.fecha}</td>
                                                <td className="px-4 py-2 capitalize">{registro.diaSemana}</td>
                                                <td className="px-4 py-2">{registro.horasTrabajadas}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${registro.tipo === "normal" ? "bg-gray-100 text-gray-600" :
                                                            registro.tipo === "extra" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                                                        }`}>
                                                        {registro.tipo === "normal" ? "Normal" : registro.tipo === "extra" ? "Extra" : "Bonificada"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500">* Días hábiles considerados: Lunes a Viernes</p>
                                <p className="text-sm text-gray-500">* Jornada laboral estándar: 8 horas diarias</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Recibo */}
            {showReciboModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 text-center border-b border-gray-100">
                            <Receipt size={48} className="mx-auto text-green-500 mb-3" />
                            <h3 className="text-xl font-bold text-blue-900">Recibo de Pago</h3>
                            <p className="text-gray-500 text-sm">Factura #{selectedItem.facturaId}</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Estudiante:</span>
                                <span className="font-medium">{estudiantes.find(e => e.id === selectedItem.estudianteId)?.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Concepto:</span>
                                <span>{selectedItem.concepto}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Monto Original:</span>
                                <span>Bs. {selectedItem.montoOriginal.toFixed(2)}</span>
                            </div>
                            {selectedItem.becaAplicada > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Descuento por Beca:</span>
                                    <span>- Bs. {selectedItem.becaAplicada.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-3">
                                <span>Total Pagado:</span>
                                <span className="text-green-600">Bs. {selectedItem.montoConBeca.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 pt-2">
                                <span>Fecha de Pago:</span>
                                <span>{selectedItem.fechaPago || new Date().toISOString().split('T')[0]}</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setShowReciboModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cerrar</button>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                <Printer size={16} className="inline mr-2" /> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modales de formularios (simplificados) */}
            {showModal && activeTab === "becas" && (
                <Modal title={editingItem ? "Editar Beca" : "Asignar Beca"} onClose={() => setShowModal(false)} onSubmit={() => setShowModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                            <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                <option>Seleccionar estudiante</option>
                                {estudiantes.map(e => <option key={e.id}>{e.nombre} {e.apellido}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Beca</label>
                                <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                    <option>Beca Media (50%)</option>
                                    <option>Beca Completa (100%)</option>
                                    <option>Beca Parcial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje</label>
                                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2"></textarea>
                        </div>
                    </div>
                </Modal>
            )}

            {showPagoModal && (
                <Modal title="Registrar Pago" onClose={() => setShowPagoModal(false)} onSubmit={() => setShowPagoModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                            <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                {estudiantes.map(e => <option key={e.id}>{e.nombre} {e.apellido}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Mensualidad" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                    <option>Mensualidad</option>
                                    <option>Inscripción</option>
                                    <option>Actividad</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={28} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar registro?</h3>
                            <p className="text-gray-500">Esta acción no se puede deshacer.</p>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg">Cancelar</button>
                                <button onClick={() => { setShowDeleteModal(false); }} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== COMPONENTES AUXILIARES ====================

const DashboardCard = ({ title, value, icon: Icon, color, subtitle }: any) => {
    const colors = {
        blue: "from-blue-900 to-blue-700",
        green: "from-green-500 to-green-600",
        red: "from-red-500 to-red-600",
        yellow: "from-yellow-500 to-yellow-600",
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`bg-gradient-to-br ${colors[color]} p-3 rounded-xl`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon: Icon, color }: any) => {
    const colors = {
        blue: "from-blue-900 to-blue-700",
        green: "from-green-500 to-green-600",
        red: "from-red-500 to-red-600",
        yellow: "from-yellow-500 to-yellow-600",
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`bg-gradient-to-br ${colors[color]} p-2 rounded-lg`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: any) => (
    <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-sm text-gray-500">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
        </p>
        <div className="flex gap-2">
            <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 bg-blue-900 text-white rounded-lg">{currentPage}</span>
            <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight size={18} />
            </button>
        </div>
    </div>
);

const Modal = ({ title, children, onClose, onSubmit }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-900">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6">{children}</div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button onClick={onSubmit} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">Guardar</button>
            </div>
        </div>
    </div>
);