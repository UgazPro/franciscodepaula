import { useState, useMemo } from "react";
import {
    BookOpen,
    Users,
    Calendar,
    FileText,
    Download,
    Upload,
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
    Clock,
    Award,
    PieChart,
    TrendingUp,
    Save,
    Printer,
    Mail,
    Settings,
    FolderOpen,
    ClipboardList,
    BarChart3,
    UserCheck,
    GraduationCap
} from "lucide-react";

// ==================== TIPOS ====================

interface Materia {
    id: number;
    nombre: string;
    codigo: string;
    horasSemanales: number;
    grado: string;
    seccion: string;
}

interface EstudianteNota {
    id: number;
    estudianteId: number;
    nombre: string;
    apellido: string;
    cedula: string;
}

interface Lapso {
    id: number;
    nombre: "I Lapso" | "II Lapso" | "III Lapso";
    fechaInicio: string;
    fechaFin: string;
    porcentaje: number;
}

interface Nota {
    id: number;
    estudianteId: number;
    materiaId: number;
    lapsoId: number;
    calificacion: number;
    observaciones?: string;
    fechaRegistro: string;
}

interface Planificacion {
    id: number;
    materiaId: number;
    lapsoId: number;
    titulo: string;
    descripcion: string;
    objetivos: string[];
    contenidos: string[];
    estrategias: string[];
    recursos: string[];
    evaluacion: string;
    fechaCreacion: string;
}

interface Formato {
    id: number;
    nombre: string;
    descripcion: string;
    tipo: "planificacion" | "registro" | "evaluacion" | "informe";
    url: string;
    size: string;
}

interface ActividadDocente {
    id: number;
    titulo: string;
    descripcion: string;
    fechaEntrega: string;
    materiaId: number;
    tipo: "tarea" | "examen" | "proyecto" | "laboratorio";
    ponderacion: number;
}

// ==================== DATOS DE EJEMPLO ====================

const materiasData: Materia[] = [
    { id: 1, nombre: "Matemática", codigo: "MAT-101", horasSemanales: 5, grado: "3er Año", seccion: "A" },
    { id: 2, nombre: "Matemática", codigo: "MAT-101", horasSemanales: 5, grado: "3er Año", seccion: "B" },
    { id: 3, nombre: "Física", codigo: "FIS-201", horasSemanales: 4, grado: "4to Año", seccion: "A" },
    { id: 4, nombre: "Química", codigo: "QUI-202", horasSemanales: 4, grado: "4to Año", seccion: "B" },
    { id: 5, nombre: "Castellano", codigo: "CAS-301", horasSemanales: 5, grado: "5to Año", seccion: "A" },
];

const estudiantesPorMateria: Record<number, EstudianteNota[]> = {
    1: [
        { id: 1, estudianteId: 1, nombre: "María", apellido: "González", cedula: "V-12345678" },
        { id: 2, estudianteId: 2, nombre: "Carlos", apellido: "Méndez", cedula: "V-87654321" },
        { id: 3, estudianteId: 3, nombre: "Sofía", apellido: "Rodríguez", cedula: "V-98765432" },
        { id: 4, estudianteId: 4, nombre: "Luis", apellido: "Fernández", cedula: "V-54321678" },
        { id: 5, estudianteId: 5, nombre: "Ana", apellido: "Martínez", cedula: "V-13579246" },
    ],
    2: [
        { id: 6, estudianteId: 6, nombre: "Javier", apellido: "Pérez", cedula: "V-24681357" },
        { id: 7, estudianteId: 7, nombre: "Valentina", apellido: "Díaz", cedula: "V-36925814" },
        { id: 8, estudianteId: 8, nombre: "Samuel", apellido: "Torres", cedula: "V-74185296" },
    ],
};

const lapsosData: Lapso[] = [
    { id: 1, nombre: "I Lapso", fechaInicio: "2024-10-01", fechaFin: "2024-12-20", porcentaje: 30 },
    { id: 2, nombre: "II Lapso", fechaInicio: "2025-01-15", fechaFin: "2025-03-28", porcentaje: 30 },
    { id: 3, nombre: "III Lapso", fechaInicio: "2025-04-07", fechaFin: "2025-06-27", porcentaje: 40 },
];

const notasData: Nota[] = [
    { id: 1, estudianteId: 1, materiaId: 1, lapsoId: 1, calificacion: 18, observaciones: "Excelente participación", fechaRegistro: "2024-11-15" },
    { id: 2, estudianteId: 2, materiaId: 1, lapsoId: 1, calificacion: 15, observaciones: "", fechaRegistro: "2024-11-15" },
    { id: 3, estudianteId: 3, materiaId: 1, lapsoId: 1, calificacion: 20, observaciones: "Mejor promedio", fechaRegistro: "2024-11-15" },
];

const planificacionesData: Planificacion[] = [
    { id: 1, materiaId: 1, lapsoId: 1, titulo: "Ecuaciones Lineales", descripcion: "Resolución de ecuaciones de primer grado", objetivos: ["Identificar ecuaciones lineales", "Resolver ecuaciones paso a paso", "Aplicar en problemas prácticos"], contenidos: ["Concepto de ecuación", "Propiedades de igualdad", "Resolución de ecuaciones"], estrategias: ["Clase expositiva", "Trabajo en grupos", "Práctica guiada"], recursos: ["Pizarra", "Guías de ejercicios", "Calculadora"], evaluacion: "Prueba escrita + trabajos prácticos", fechaCreacion: "2024-10-01" },
];

const formatosData: Formato[] = [
    { id: 1, nombre: "Plan de Clase Diario", descripcion: "Formato para planificar cada clase", tipo: "planificacion", url: "#", size: "45 KB" },
    { id: 2, nombre: "Registro de Notas", descripcion: "Plantilla para registro de calificaciones", tipo: "registro", url: "#", size: "32 KB" },
    { id: 3, nombre: "Rúbrica de Evaluación", descripcion: "Criterios para evaluar trabajos", tipo: "evaluacion", url: "#", size: "28 KB" },
    { id: 4, nombre: "Informe de Rendimiento", descripcion: "Reporte individual por estudiante", tipo: "informe", url: "#", size: "56 KB" },
    { id: 5, nombre: "Lista de Cotejo", descripcion: "Checklist para proyectos", tipo: "evaluacion", url: "#", size: "24 KB" },
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function Teachers() {
    const [activeTab, setActiveTab] = useState<"planificacion" | "notas" | "formatos" | "actividades">("planificacion");
    const [selectedMateria, setSelectedMateria] = useState<number>(1);
    const [selectedLapso, setSelectedLapso] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [selectedEstudiante, setSelectedEstudiante] = useState<any>(null);

    // Estados para datos
    const [materias] = useState<Materia[]>(materiasData);
    const [lapsos] = useState<Lapso[]>(lapsosData);
    const [notas, setNotas] = useState<Nota[]>(notasData);
    const [planificaciones, setPlanificaciones] = useState<Planificacion[]>(planificacionesData);
    const [formatos] = useState<Formato[]>(formatosData);

    // Formulario para notas
    const [notaEditando, setNotaEditando] = useState<{ [key: number]: number }>({});

    // Formulario para planificación
    const [formPlanificacion, setFormPlanificacion] = useState<Partial<Planificacion>>({
        titulo: "", descripcion: "", objetivos: [], contenidos: [], estrategias: [], recursos: "", evaluacion: ""
    });

    // Obtener estudiantes de la materia seleccionada
    const estudiantes = estudiantesPorMateria[selectedMateria] || [];

    // Obtener notas de la materia y lapso seleccionado
    const notasFiltradas = notas.filter(n => n.materiaId === selectedMateria && n.lapsoId === selectedLapso);

    // Calcular estadísticas
    const estadisticas = useMemo(() => {
        const notasMateria = notas.filter(n => n.materiaId === selectedMateria && n.lapsoId === selectedLapso);
        const aprobados = notasMateria.filter(n => n.calificacion >= 10).length;
        const reprobados = notasMateria.filter(n => n.calificacion < 10).length;
        const promedio = notasMateria.reduce((sum, n) => sum + n.calificacion, 0) / (notasMateria.length || 1);
        const maxNota = Math.max(...notasMateria.map(n => n.calificacion), 0);
        const minNota = Math.min(...notasMateria.map(n => n.calificacion), 0);
        return { aprobados, reprobados, promedio, maxNota, minNota, total: notasMateria.length };
    }, [notas, selectedMateria, selectedLapso]);

    // Manejar cambio de nota
    const handleNotaChange = (estudianteId: number, valor: number) => {
        setNotaEditando(prev => ({ ...prev, [estudianteId]: valor }));
    };

    // Guardar nota
    const guardarNota = (estudianteId: number) => {
        const nuevaCalificacion = notaEditando[estudianteId];
        if (nuevaCalificacion === undefined) return;

        const notaExistente = notas.find(n => n.estudianteId === estudianteId && n.materiaId === selectedMateria && n.lapsoId === selectedLapso);

        if (notaExistente) {
            setNotas(notas.map(n => n.id === notaExistente.id ? { ...n, calificacion: nuevaCalificacion } : n));
        } else {
            const nuevaNota: Nota = {
                id: notas.length + 1,
                estudianteId,
                materiaId: selectedMateria,
                lapsoId: selectedLapso,
                calificacion: nuevaCalificacion,
                observaciones: "",
                fechaRegistro: new Date().toISOString().split('T')[0]
            };
            setNotas([...notas, nuevaNota]);
        }
        setNotaEditando(prev => { const newState = { ...prev }; delete newState[estudianteId]; return newState; });
    };

    // Guardar todas las notas
    const guardarTodasNotas = () => {
        Object.entries(notaEditando).forEach(([estudianteId, calificacion]) => {
            guardarNota(parseInt(estudianteId));
        });
    };

    const materiaActual = materias.find(m => m.id === selectedMateria);
    const lapsoActual = lapsos.find(l => l.id === selectedLapso);
    const planificacionActual = planificaciones.find(p => p.materiaId === selectedMateria && p.lapsoId === selectedLapso);

    const getCalificacionColor = (nota: number) => {
        if (nota >= 18) return "text-green-600 font-bold";
        if (nota >= 15) return "text-blue-600";
        if (nota >= 10) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Gestión Docente</h1>
                    <p className="text-gray-500 text-sm mt-1">Planificaciones, notas y recursos para profesores</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedMateria}
                        onChange={(e) => setSelectedMateria(parseInt(e.target.value))}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 bg-white"
                    >
                        {materias.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre} - {m.grado} "{m.seccion}"</option>
                        ))}
                    </select>
                    <select
                        value={selectedLapso}
                        onChange={(e) => setSelectedLapso(parseInt(e.target.value))}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 bg-white"
                    >
                        {lapsos.map(l => (
                            <option key={l.id} value={l.id}>{l.nombre} ({l.porcentaje}%)</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Información de Materia */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-5 text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <h2 className="text-xl font-bold">{materiaActual?.nombre}</h2>
                        <p className="text-blue-100 text-sm mt-1">{materiaActual?.grado} - Sección {materiaActual?.seccion} | {materiaActual?.horasSemanales} horas semanales</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white/20 rounded-lg px-3 py-1 text-center">
                            <p className="text-xs">Estudiantes</p>
                            <p className="text-xl font-bold">{estudiantes.length}</p>
                        </div>
                        <div className="bg-white/20 rounded-lg px-3 py-1 text-center">
                            <p className="text-xs">Promedio</p>
                            <p className="text-xl font-bold">{estadisticas.promedio.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                {[
                    { id: "planificacion", label: "Planificación", icon: ClipboardList },
                    { id: "notas", label: "Carga de Notas", icon: GraduationCap },
                    { id: "formatos", label: "Formatos y Recursos", icon: FileText },
                    { id: "actividades", label: "Actividades", icon: Calendar },
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

            {/* Tab: Planificación */}
            {activeTab === "planificacion" && (
                <div className="space-y-6">
                    {planificacionActual ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">{planificacionActual.titulo}</h3>
                                    <p className="text-sm text-gray-500">Creada el {planificacionActual.fechaCreacion}</p>
                                </div>
                                <button onClick={() => { setEditingItem(planificacionActual); setShowModal(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                    <Edit size={16} /> Editar
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Descripción</h4>
                                    <p className="text-gray-600">{planificacionActual.descripcion}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Award size={16} className="text-green-500" /> Objetivos</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                                            {planificacionActual.objetivos.map((obj, i) => <li key={i}>{obj}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><BookOpen size={16} className="text-green-500" /> Contenidos</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                                            {planificacionActual.contenidos.map((cont, i) => <li key={i}>{cont}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">Estrategias de Enseñanza</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                                            {planificacionActual.estrategias.map((est, i) => <li key={i}>{est}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">Recursos</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                                            {planificacionActual.recursos.map((rec, i) => <li key={i}>{rec}</li>)}
                                        </ul>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">Evaluación</h4>
                                    <p className="text-gray-700">{planificacionActual.evaluacion}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay planificación para este lapso</h3>
                            <p className="text-gray-400 mb-4">Crea una planificación para organizar tus clases</p>
                            <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="flex items-center gap-2 mx-auto bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition">
                                <Plus size={18} /> Crear Planificación
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Carga de Notas */}
            {activeTab === "notas" && (
                <div className="space-y-6">
                    {/* Tarjetas de estadísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard title="Aprobados" value={estadisticas.aprobados} total={estadisticas.total} icon={CheckCircle} color="green" />
                        <StatCard title="Reprobados" value={estadisticas.reprobados} total={estadisticas.total} icon={AlertCircle} color="red" />
                        <StatCard title="Promedio" value={estadisticas.promedio.toFixed(1)} unit="/20" icon={TrendingUp} color="blue" />
                        <StatCard title="Nota Máxima" value={estadisticas.maxNota} unit="/20" icon={Award} color="yellow" />
                        <StatCard title="Nota Mínima" value={estadisticas.minNota} unit="/20" icon={AlertCircle} color="orange" />
                    </div>

                    {/* Tabla de notas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-blue-900">Registro de Notas - {lapsoActual?.nombre}</h3>
                            {Object.keys(notaEditando).length > 0 && (
                                <button onClick={guardarTodasNotas} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                    <Save size={16} /> Guardar todas
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cédula</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nota Actual</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nueva Nota</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {estudiantes.map((est, idx) => {
                                        const notaActual = notasFiltradas.find(n => n.estudianteId === est.estudianteId);
                                        const notaEdit = notaEditando[est.estudianteId];
                                        return (
                                            <tr key={est.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{est.nombre} {est.apellido}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{est.cedula}</td>
                                                <td className="px-6 py-4">
                                                    {notaActual ? (
                                                        <span className={`text-lg font-semibold ${getCalificacionColor(notaActual.calificacion)}`}>
                                                            {notaActual.calificacion}/20
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">Sin nota</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        step="0.5"
                                                        value={notaEdit !== undefined ? notaEdit : (notaActual?.calificacion || "")}
                                                        onChange={(e) => handleNotaChange(est.estudianteId, parseFloat(e.target.value))}
                                                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-green-500"
                                                        placeholder="0-20"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => guardarNota(est.estudianteId)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                                                        <Save size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Gráfico de rendimiento simplificado */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-4">Distribución de Notas</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Excelente (18-20)</span>
                                    <span>{notasFiltradas.filter(n => n.calificacion >= 18).length} estudiantes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(notasFiltradas.filter(n => n.calificacion >= 18).length / (estudiantes.length || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Sobresaliente (15-17)</span>
                                    <span>{notasFiltradas.filter(n => n.calificacion >= 15 && n.calificacion < 18).length} estudiantes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(notasFiltradas.filter(n => n.calificacion >= 15 && n.calificacion < 18).length / (estudiantes.length || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Aprobado (10-14)</span>
                                    <span>{notasFiltradas.filter(n => n.calificacion >= 10 && n.calificacion < 15).length} estudiantes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(notasFiltradas.filter(n => n.calificacion >= 10 && n.calificacion < 15).length / (estudiantes.length || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Reprobado (0-9)</span>
                                    <span>{notasFiltradas.filter(n => n.calificacion < 10).length} estudiantes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(notasFiltradas.filter(n => n.calificacion < 10).length / (estudiantes.length || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Formatos y Recursos */}
            {activeTab === "formatos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formatos.map((formato) => (
                        <div key={formato.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText size={24} className="text-blue-900" />
                                </div>
                                <span className="text-xs text-gray-400">{formato.size}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">{formato.nombre}</h3>
                            <p className="text-sm text-gray-500 mb-3">{formato.descripcion}</p>
                            <div className="flex gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <Eye size={16} /> Vista previa
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                    <Download size={16} /> Descargar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab: Actividades */}
            {activeTab === "actividades" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-blue-900">Actividades Planificadas</h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                            <Plus size={16} /> Nueva Actividad
                        </button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Taller de Resolución de Problemas</h4>
                                        <p className="text-sm text-gray-500 mt-1">Actividad práctica para aplicar ecuaciones lineales en problemas cotidianos</p>
                                        <div className="flex gap-3 mt-2">
                                            <span className="text-xs text-gray-400">Entrega: 25/11/2024</span>
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Tarea</span>
                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Ponderación: 15%</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Planificación */}
            {showModal && activeTab === "planificacion" && (
                <Modal title={editingItem ? "Editar Planificación" : "Nueva Planificación"} onClose={() => setShowModal(false)} onSubmit={() => setShowModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos (uno por línea)</label>
                            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" placeholder="Identificar...&#10;Resolver...&#10;Aplicar..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contenidos</label>
                            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estrategias de Evaluación</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ==================== COMPONENTES AUXILIARES ====================

const StatCard = ({ title, value, total, unit, icon: Icon, color }: any) => {
    const colors = {
        green: "from-green-500 to-green-600",
        red: "from-red-500 to-red-600",
        blue: "from-blue-900 to-blue-700",
        yellow: "from-yellow-500 to-yellow-600",
        orange: "from-orange-500 to-orange-600",
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {value}{unit && <span className="text-sm font-normal text-gray-400">{unit}</span>}
                    </p>
                    {total !== undefined && <p className="text-xs text-gray-400">de {total} estudiantes</p>}
                </div>
                <div className={`bg-gradient-to-br ${colors[color]} p-2 rounded-lg`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
        </div>
    );
};

const Modal = ({ title, children, onClose, onSubmit }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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