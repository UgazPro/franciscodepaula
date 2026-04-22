import { useState, useEffect, useMemo } from "react";
import {
    DollarSign,
    Users,
    FileText,
    Award,
    Calendar,
    Clock,
    TrendingUp,
    Download,
    Plus,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Edit,
    Trash2,
    Eye,
    X,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Receipt,
    Percent,
    Briefcase,
    UserCheck,
    Building2,
    Printer
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
    salarioBase: number;
    horasTrabajadas: number;
    horasExtra: number;
    horasBonificacion: number;
    valorHora: number;
    bonificacion: number;
    deducciones: {
        iva?: number;
        prestamo?: number;
        seguro?: number;
        otros?: number;
    };
    estatus: "activo" | "inactivo" | "vacaciones";
    cuentaBancaria: string;
}

interface Nomina {
    id: number;
    personalId: number;
    periodo: string;
    quincena: 1 | 2;
    fechaPago: string;
    horasNormales: number;
    horasExtra: number;
    horasBonificacion: number;
    salarioBruto: number;
    bonificacionTotal: number;
    deduccionesTotal: number;
    salarioNeto: number;
    pagado: boolean;
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

interface EstudiantePago {
    id: number;
    estudianteId: number;
    nombreEstudiante: string;
    cedulaEstudiante: string;
    grado: string;
    seccion: string;
    representanteId: number;
    representanteNombre: string;
}

interface PagoRepresentante {
    id: number;
    estudianteId: number;
    representanteId: number;
    concepto: string;
    monto: number;
    fechaEmision: string;
    fechaVencimiento: string;
    fechaPago?: string;
    estado: "pendiente" | "pagado" | "vencido" | "anulado";
    tipo: "mensualidad" | "inscripcion" | "actividad" | "otros";
    facturaId: number;
}

interface Factura {
    id: number;
    numero: string;
    estudianteId: number;
    representanteId: number;
    fechaEmision: string;
    fechaVencimiento: string;
    subtotal: number;
    iva: number;
    total: number;
    estado: "pendiente" | "pagada" | "vencida";
    items: FacturaItem[];
}

interface FacturaItem {
    id: number;
    concepto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
}

interface Beca {
    id: number;
    estudianteId: number;
    tipo: "completa" | "media" | "ninguna";
    porcentaje: number;
    fechaInicio: string;
    fechaFin?: string;
    motivo: string;
    activa: boolean;
}

// ==================== DATOS DE EJEMPLO ====================

const personalData: Personal[] = [
    { id: 1, cedula: "V-12345678", nombre: "María", apellido: "González", cargo: "Directora", departamento: "docente", fechaIngreso: "2015-08-15", salarioBase: 1200, horasTrabajadas: 160, horasExtra: 8, horasBonificacion: 4, valorHora: 7.5, bonificacion: 150, deducciones: { iva: 0.16, seguro: 35, otros: 20 }, estatus: "activo", cuentaBancaria: "0102-1234-5678901234" },
    { id: 2, cedula: "V-87654321", nombre: "Carlos", apellido: "Méndez", cargo: "Profesor Matemáticas", departamento: "docente", fechaIngreso: "2018-03-10", salarioBase: 950, horasTrabajadas: 160, horasExtra: 5, horasBonificacion: 2, valorHora: 5.94, bonificacion: 80, deducciones: { iva: 0.16, seguro: 30 }, estatus: "activo", cuentaBancaria: "0105-9876-5432109876" },
    { id: 3, cedula: "V-98765432", nombre: "Ana", apellido: "Rodríguez", cargo: "Secretaria", departamento: "administrativo", fechaIngreso: "2020-01-20", salarioBase: 700, horasTrabajadas: 160, horasExtra: 0, horasBonificacion: 0, valorHora: 4.38, bonificacion: 0, deducciones: { iva: 0.16, seguro: 25 }, estatus: "activo", cuentaBancaria: "0108-4567-1234567890" },
    { id: 4, cedula: "V-54321678", nombre: "Luis", apellido: "Fernández", cargo: "Mantenimiento", departamento: "mantenimiento", fechaIngreso: "2019-06-15", salarioBase: 600, horasTrabajadas: 160, horasExtra: 12, horasBonificacion: 0, valorHora: 3.75, bonificacion: 0, deducciones: { iva: 0.16, seguro: 20, prestamo: 50 }, estatus: "activo", cuentaBancaria: "0123-7890-4567890123" },
    { id: 5, cedula: "V-13579246", nombre: "Sofía", apellido: "Martínez", cargo: "Coordinadora", departamento: "docente", fechaIngreso: "2017-11-01", salarioBase: 1100, horasTrabajadas: 160, horasExtra: 6, horasBonificacion: 3, valorHora: 6.88, bonificacion: 120, deducciones: { iva: 0.16, seguro: 35 }, estatus: "activo", cuentaBancaria: "0146-3210-9876543210" },
];

const estudiantesPago: EstudiantePago[] = [
    { id: 1, estudianteId: 1, nombreEstudiante: "María González", cedulaEstudiante: "V-12345678", grado: "3er Año", seccion: "A", representanteId: 1, representanteNombre: "Carlos González" },
    { id: 2, estudianteId: 2, nombreEstudiante: "Carlos Méndez Jr", cedulaEstudiante: "V-87654321", grado: "4to Año", seccion: "B", representanteId: 2, representanteNombre: "Ana Méndez" },
    { id: 3, estudianteId: 3, nombreEstudiante: "Sofía Rodríguez", cedulaEstudiante: "V-98765432", grado: "2do Año", seccion: "A", representanteId: 3, representanteNombre: "Pedro Rodríguez" },
];

const pagosData: PagoRepresentante[] = [
    { id: 1, estudianteId: 1, representanteId: 1, concepto: "Mensualidad Marzo", monto: 250, fechaEmision: "2024-03-01", fechaVencimiento: "2024-03-15", estado: "pagado", tipo: "mensualidad", facturaId: 1001 },
    { id: 2, estudianteId: 1, representanteId: 1, concepto: "Mensualidad Abril", monto: 250, fechaEmision: "2024-04-01", fechaVencimiento: "2024-04-15", estado: "pendiente", tipo: "mensualidad", facturaId: 1002 },
    { id: 3, estudianteId: 2, representanteId: 2, concepto: "Inscripción 2024", monto: 150, fechaEmision: "2024-01-10", fechaVencimiento: "2024-01-31", estado: "pagado", tipo: "inscripcion", facturaId: 1003 },
];

const becasData: Beca[] = [
    { id: 1, estudianteId: 1, tipo: "media", porcentaje: 50, fechaInicio: "2024-01-01", motivo: "Excelencia académica", activa: true },
    { id: 2, estudianteId: 2, tipo: "completa", porcentaje: 100, fechaInicio: "2024-01-01", motivo: "Beca deportiva", activa: true },
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function Administracion() {
    const [activeTab, setActiveTab] = useState<"nominas" | "pagos" | "facturas" | "becas">("nominas");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [selectedPeriodo, setSelectedPeriodo] = useState("2024-04");

    // Estados para datos
    const [personal, setPersonal] = useState<Personal[]>(personalData);
    const [nominas, setNominas] = useState<Nomina[]>([]);
    const [pagos, setPagos] = useState<PagoRepresentante[]>(pagosData);
    const [becas, setBecas] = useState<Beca[]>(becasData);

    // Formulario para personal
    const [formPersonal, setFormPersonal] = useState<Partial<Personal>>({
        cedula: "", nombre: "", apellido: "", cargo: "", departamento: "docente",
        fechaIngreso: "", salarioBase: 0, horasTrabajadas: 160, horasExtra: 0,
        horasBonificacion: 0, bonificacion: 0, deducciones: {}, estatus: "activo"
    });

    // Formulario para pago
    const [formPago, setFormPago] = useState<Partial<PagoRepresentante>>({
        concepto: "", monto: 0, fechaEmision: "", fechaVencimiento: "", tipo: "mensualidad"
    });

    // Formulario para beca
    const [formBeca, setFormBeca] = useState<Partial<Beca>>({
        estudianteId: 0, tipo: "ninguna", porcentaje: 0, fechaInicio: "", motivo: "", activa: true
    });

    // Generar nóminas automáticamente
    useEffect(() => {
        const generarNominas = () => {
            const nuevasNominas: Nomina[] = [];
            const [year, month] = selectedPeriodo.split("-");

            personal.filter(p => p.estatus === "activo").forEach(person => {
                // Cálculos automáticos
                const horasNormales = person.horasTrabajadas;
                const horasExtra = person.horasExtra;
                const horasBonificacion = person.horasBonificacion;

                const salarioBruto = (horasNormales * person.valorHora) + (horasExtra * person.valorHora * 1.5);
                const bonificacionTotal = person.bonificacion + (horasBonificacion * person.valorHora);
                const deduccionesTotal = Object.values(person.deducciones).reduce((a, b) => a + (b || 0), 0);
                const salarioNeto = salarioBruto + bonificacionTotal - deduccionesTotal;

                nuevasNominas.push({
                    id: nuevasNominas.length + 1,
                    personalId: person.id,
                    periodo: selectedPeriodo,
                    quincena: 1,
                    fechaPago: `${year}-${month}-15`,
                    horasNormales,
                    horasExtra,
                    horasBonificacion,
                    salarioBruto,
                    bonificacionTotal,
                    deduccionesTotal,
                    salarioNeto,
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
            return pagos.filter(p =>
                p.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.estado.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (activeTab === "becas") {
            return becas.filter(b => {
                const estudiante = estudiantesPago.find(e => e.estudianteId === b.estudianteId);
                return estudiante?.nombreEstudiante.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        return personal;
    }, [activeTab, nominas, pagos, becas, personal, searchTerm]);

    // Paginación
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const calcularTotalesNominas = () => {
        const totalBruto = nominas.reduce((sum, n) => sum + n.salarioBruto, 0);
        const totalBonificaciones = nominas.reduce((sum, n) => sum + n.bonificacionTotal, 0);
        const totalDeducciones = nominas.reduce((sum, n) => sum + n.deduccionesTotal, 0);
        const totalNeto = nominas.reduce((sum, n) => sum + n.salarioNeto, 0);
        return { totalBruto, totalBonificaciones, totalDeducciones, totalNeto };
    };

    const calcularTotalesPagos = () => {
        const totalPendiente = pagos.filter(p => p.estado === "pendiente").reduce((sum, p) => sum + p.monto, 0);
        const totalPagado = pagos.filter(p => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0);
        const totalVencido = pagos.filter(p => p.estado === "vencido").reduce((sum, p) => sum + p.monto, 0);
        return { totalPendiente, totalPagado, totalVencido };
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "pagado": return "bg-green-100 text-green-700";
            case "pendiente": return "bg-yellow-100 text-yellow-700";
            case "vencido": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case "pagado": return <CheckCircle size={14} />;
            case "pendiente": return <AlertCircle size={14} />;
            case "vencido": return <AlertCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Administración</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestión de nóminas, pagos, facturación y becas</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <Plus size={18} />
                    {activeTab === "nominas" ? "Nueva Nómina" : activeTab === "pagos" ? "Registrar Pago" : activeTab === "becas" ? "Asignar Beca" : "Nuevo Personal"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                {[
                    { id: "nominas", label: "Nóminas", icon: Briefcase },
                    { id: "pagos", label: "Pagos Representantes", icon: CreditCard },
                    { id: "facturas", label: "Facturación", icon: Receipt },
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

            {/* Barra de búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Buscar por ${activeTab === "nominas" ? "personal" : activeTab === "pagos" ? "concepto o estado" : activeTab === "becas" ? "estudiante" : "nombre"}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        />
                    </div>
                    {activeTab === "nominas" && (
                        <div className="flex gap-2">
                            <input
                                type="month"
                                value={selectedPeriodo}
                                onChange={(e) => setSelectedPeriodo(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                            />
                            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                <Download size={18} />
                                Exportar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tarjetas de Resumen */}
            {activeTab === "nominas" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard title="Salario Bruto" value={`$${calcularTotalesNominas().totalBruto.toFixed(2)}`} icon={DollarSign} color="blue" />
                    <SummaryCard title="Bonificaciones" value={`$${calcularTotalesNominas().totalBonificaciones.toFixed(2)}`} icon={TrendingUp} color="green" />
                    <SummaryCard title="Deducciones" value={`$${calcularTotalesNominas().totalDeducciones.toFixed(2)}`} icon={AlertCircle} color="red" />
                    <SummaryCard title="Salario Neto" value={`$${calcularTotalesNominas().totalNeto.toFixed(2)}`} icon={CheckCircle} color="green" />
                </div>
            )}

            {activeTab === "pagos" && (
                <div className="grid grid-cols-3 gap-4">
                    <SummaryCard title="Pendiente" value={`$${calcularTotalesPagos().totalPendiente.toFixed(2)}`} icon={Clock} color="yellow" />
                    <SummaryCard title="Pagado" value={`$${calcularTotalesPagos().totalPagado.toFixed(2)}`} icon={CheckCircle} color="green" />
                    <SummaryCard title="Vencido" value={`$${calcularTotalesPagos().totalVencido.toFixed(2)}`} icon={AlertCircle} color="red" />
                </div>
            )}

            {/* Tabla de Nóminas */}
            {activeTab === "nominas" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Personal</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cargo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horas</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Salario Bruto</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bonificación</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Deducciones</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Neto</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
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
                                                        <p className="text-xs text-gray-400">{person?.cedula}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{person?.cargo}</td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5 text-sm">
                                                    <p>Normal: {nom.horasNormales}h</p>
                                                    <p>Extra: {nom.horasExtra}h</p>
                                                    <p>Bonif: {nom.horasBonificacion}h</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-800">${nom.salarioBruto.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-green-600">${nom.bonificacionTotal.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-red-600">${nom.deduccionesTotal.toFixed(2)}</td>
                                            <td className="px-6 py-4 font-bold text-blue-900">${nom.salarioNeto.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${nom.pagado ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                    {nom.pagado ? "Pagado" : "Pendiente"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} />
                </div>
            )}

            {/* Tabla de Pagos */}
            {activeTab === "pagos" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Concepto</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Emisión</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vencimiento</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map((pago: any) => {
                                    const estudiante = estudiantesPago.find(e => e.estudianteId === pago.estudianteId);
                                    return (
                                        <tr key={pago.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-800">{estudiante?.nombreEstudiante}</p>
                                                    <p className="text-xs text-gray-400">{estudiante?.grado} - {estudiante?.seccion}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{pago.concepto}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">${pago.monto.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-600">{pago.fechaEmision}</td>
                                            <td className="px-6 py-4 text-gray-600">{pago.fechaVencimiento}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pago.estado)}`}>
                                                    {getEstadoIcon(pago.estado)}
                                                    {pago.estado === "pagado" ? "Pagado" : pago.estado === "pendiente" ? "Pendiente" : "Vencido"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                        <Printer size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                                                        <CheckCircle size={16} />
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
            )}

            {/* Tabla de Becas */}
            {activeTab === "becas" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo de Beca</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Porcentaje</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Inicio</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Motivo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.map((beca: any) => {
                                    const estudiante = estudiantesPago.find(e => e.estudianteId === beca.estudianteId);
                                    return (
                                        <tr key={beca.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-800">{estudiante?.nombreEstudiante}</p>
                                                    <p className="text-xs text-gray-400">{estudiante?.grado} - {estudiante?.seccion}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${beca.tipo === "completa" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                                    {beca.tipo === "completa" ? "Beca Completa" : beca.tipo === "media" ? "Beca Media" : "Sin beca"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{beca.porcentaje}%</td>
                                            <td className="px-6 py-4 text-gray-600">{beca.fechaInicio}</td>
                                            <td className="px-6 py-4 text-gray-600">{beca.motivo}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${beca.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                                    {beca.activa ? "Activa" : "Inactiva"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setEditingItem(beca); setFormBeca(beca); setShowModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => { setSelectedItem(beca); setShowDeleteModal(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
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
            )}

            {/* Modal de Registro de Pago */}
            {showModal && activeTab === "pagos" && (
                <Modal title="Registrar Pago" onClose={() => setShowModal(false)} onSubmit={() => { }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
                            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                                <option value="">Seleccionar estudiante</option>
                                {estudiantesPago.map(e => (
                                    <option key={e.id} value={e.estudianteId}>{e.nombreEstudiante} - {e.grado}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" placeholder="Ej: Mensualidad Abril" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                                    <option value="mensualidad">Mensualidad</option>
                                    <option value="inscripcion">Inscripción</option>
                                    <option value="actividad">Actividad Extraescolar</option>
                                    <option value="otros">Otros</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Emisión</label>
                                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
                                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de Asignación de Beca */}
            {showModal && activeTab === "becas" && (
                <Modal title={editingItem ? "Editar Beca" : "Asignar Beca"} onClose={() => setShowModal(false)} onSubmit={() => { }}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
                            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                                <option value="">Seleccionar estudiante</option>
                                {estudiantesPago.map(e => (
                                    <option key={e.id} value={e.estudianteId}>{e.nombreEstudiante} - {e.grado}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Beca *</label>
                                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500">
                                    <option value="media">Beca Media (50%)</option>
                                    <option value="completa">Beca Completa (100%)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" placeholder="Ej: Excelencia académica, beca deportiva, situación económica..."></textarea>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de Confirmación */}
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
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                                <button onClick={() => { setShowDeleteModal(false); }} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== COMPONENTES AUXILIARES ====================

const SummaryCard = ({ title, value, icon: Icon, color }: any) => {
    const colors = { blue: "from-blue-900 to-blue-700", green: "from-green-500 to-green-600", red: "from-red-500 to-red-600", yellow: "from-yellow-500 to-yellow-600" };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className={`bg-gradient-to-br ${colors[color]} p-2 rounded-lg`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: any) => (
    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-sm text-gray-500">Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}</p>
        <div className="flex gap-2">
            <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"><ChevronLeft size={18} /></button>
            <span className="px-4 py-2 bg-blue-900 text-white rounded-lg">{currentPage}</span>
            <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"><ChevronRight size={18} /></button>
        </div>
    </div>
);

const Modal = ({ title, children, onClose, onSubmit }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-900">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={20} /></button>
            </div>
            <div className="p-6">{children}</div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                <button onClick={onSubmit} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">Guardar</button>
            </div>
        </div>
    </div>
);



