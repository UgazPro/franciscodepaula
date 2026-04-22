import { useState, useEffect, useMemo } from "react";
import {
    Search,
    Plus,
    Grid3x3,
    Table2,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    X,
    GraduationCap,
    Calendar,
    Phone,
    Mail,
    MapPin,
    User,
    BookOpen,
    CheckCircle,
    AlertCircle
} from "lucide-react";

// Tipos de datos
interface Estudiante {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    edad: number;
    grado: string;
    seccion: string;
    representante: string;
    telefono: string;
    email: string;
    direccion: string;
    estado: "activo" | "inactivo" | "suspendido";
    promedio: number;
    incidencias: number;
}

// Datos de ejemplo (simulados)
const estudiantesData: Estudiante[] = [
    { id: 1, cedula: "V-12345678", nombre: "María", apellido: "González", fechaNacimiento: "2010-05-15", edad: 14, grado: "3er Año", seccion: "A", representante: "Carlos González", telefono: "0412-1234567", email: "maria.gonzalez@email.com", direccion: "Av. Principal, Casa 123", estado: "activo", promedio: 88.5, incidencias: 2 },
    { id: 2, cedula: "V-87654321", nombre: "Carlos", apellido: "Méndez", fechaNacimiento: "2009-08-22", edad: 15, grado: "4to Año", seccion: "B", representante: "Ana Méndez", telefono: "0416-7654321", email: "carlos.mendez@email.com", direccion: "Calle 5, Qta 45", estado: "activo", promedio: 92.3, incidencias: 0 },
    { id: 3, cedula: "E-98765432", nombre: "Sofía", apellido: "Rodríguez", fechaNacimiento: "2011-03-10", edad: 13, grado: "2do Año", seccion: "A", representante: "Pedro Rodríguez", telefono: "0424-9876543", email: "sofia.rodriguez@email.com", direccion: "Urb. Las Flores, Casa 78", estado: "activo", promedio: 95.2, incidencias: 1 },
    { id: 4, cedula: "V-54321678", nombre: "Luis", apellido: "Fernández", fechaNacimiento: "2008-11-30", edad: 16, grado: "5to Año", seccion: "C", representante: "Marta Fernández", telefono: "0412-3456789", email: "luis.fernandez@email.com", direccion: "Av. Libertador, Edif. Central", estado: "activo", promedio: 78.4, incidencias: 5 },
    { id: 5, cedula: "V-13579246", nombre: "Ana", apellido: "Martínez", fechaNacimiento: "2010-07-18", edad: 14, grado: "3er Año", seccion: "B", representante: "José Martínez", telefono: "0416-1239876", email: "ana.martinez@email.com", direccion: "Barrio Obrero, Casa 12", estado: "inactivo", promedio: 82.1, incidencias: 3 },
    { id: 6, cedula: "V-24681357", nombre: "Javier", apellido: "Pérez", fechaNacimiento: "2009-12-05", edad: 15, grado: "4to Año", seccion: "A", representante: "Laura Pérez", telefono: "0424-5671234", email: "javier.perez@email.com", direccion: "Urb. El Parque, Qta 23", estado: "activo", promedio: 90.7, incidencias: 1 },
    { id: 7, cedula: "V-36925814", nombre: "Valentina", apellido: "Díaz", fechaNacimiento: "2011-09-14", edad: 13, grado: "2do Año", seccion: "C", representante: "Roberto Díaz", telefono: "0412-7891234", email: "valentina.diaz@email.com", direccion: "Av. Las Américas, Piso 3", estado: "activo", promedio: 96.8, incidencias: 0 },
    { id: 8, cedula: "V-74185296", nombre: "Samuel", apellido: "Torres", fechaNacimiento: "2008-04-25", edad: 16, grado: "5to Año", seccion: "B", representante: "Elena Torres", telefono: "0416-4567891", email: "samuel.torres@email.com", direccion: "Calle Real, Casa 56", estado: "suspendido", promedio: 65.2, incidencias: 8 },
    { id: 9, cedula: "V-95175382", nombre: "Isabella", apellido: "Rojas", fechaNacimiento: "2010-01-20", edad: 14, grado: "3er Año", seccion: "C", representante: "Andrés Rojas", telefono: "0424-3216549", email: "isabella.rojas@email.com", direccion: "Urb. Los Jardines, Casa 34", estado: "activo", promedio: 89.4, incidencias: 2 },
    { id: 10, cedula: "V-15935748", nombre: "Diego", apellido: "Castro", fechaNacimiento: "2009-06-12", edad: 15, grado: "4to Año", seccion: "B", representante: "Patricia Castro", telefono: "0412-9873214", email: "diego.castro@email.com", direccion: "Av. Bolívar, Edif. 7", estado: "activo", promedio: 93.6, incidencias: 1 },
    { id: 11, cedula: "V-75315982", nombre: "Camila", apellido: "Ortega", fechaNacimiento: "2011-10-08", edad: 13, grado: "2do Año", seccion: "A", representante: "Fernando Ortega", telefono: "0416-7531598", email: "camila.ortega@email.com", direccion: "Calle 8, Casa 90", estado: "activo", promedio: 87.3, incidencias: 2 },
    { id: 12, cedula: "V-85214796", nombre: "Andrés", apellido: "Silva", fechaNacimiento: "2008-02-28", edad: 16, grado: "5to Año", seccion: "A", representante: "Gabriela Silva", telefono: "0424-8521479", email: "andres.silva@email.com", direccion: "Urb. Santa Mónica, Casa 12", estado: "activo", promedio: 91.5, incidencias: 1 },
];

const grados = ["1er Año", "2do Año", "3er Año", "4to Año", "5to Año"];
const secciones = ["A", "B", "C"];

export default function Students() {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>(estudiantesData);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrado, setSelectedGrado] = useState("");
    const [selectedEstado, setSelectedEstado] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(null);
    const [editingStudent, setEditingStudent] = useState<Estudiante | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Formulario para nuevo/editar estudiante
    const [formData, setFormData] = useState<Partial<Estudiante>>({
        cedula: "",
        nombre: "",
        apellido: "",
        fechaNacimiento: "",
        grado: "",
        seccion: "",
        representante: "",
        telefono: "",
        email: "",
        direccion: "",
        estado: "activo",
    });

    // Filtrar estudiantes
    const filteredEstudiantes = useMemo(() => {
        return estudiantes.filter((est) => {
            const matchesSearch = searchTerm === "" ||
                est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                est.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                est.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                est.representante.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGrado = selectedGrado === "" || est.grado === selectedGrado;
            const matchesEstado = selectedEstado === "" || est.estado === selectedEstado;

            return matchesSearch && matchesGrado && matchesEstado;
        });
    }, [estudiantes, searchTerm, selectedGrado, selectedEstado]);

    // Paginación
    const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage);
    const paginatedEstudiantes = filteredEstudiantes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGrado, selectedEstado]);

    // Calcular edad desde fecha de nacimiento
    const calcularEdad = (fechaNacimiento: string) => {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingStudent) {
            // Editar estudiante existente
            const updatedEstudiantes = estudiantes.map(est =>
                est.id === editingStudent.id
                    ? { ...est, ...formData, edad: calcularEdad(formData.fechaNacimiento || "") } as Estudiante
                    : est
            );
            setEstudiantes(updatedEstudiantes);
        } else {
            // Crear nuevo estudiante
            const newId = Math.max(...estudiantes.map(e => e.id)) + 1;
            const newEstudiante: Estudiante = {
                id: newId,
                cedula: formData.cedula || "",
                nombre: formData.nombre || "",
                apellido: formData.apellido || "",
                fechaNacimiento: formData.fechaNacimiento || "",
                edad: calcularEdad(formData.fechaNacimiento || ""),
                grado: formData.grado || "",
                seccion: formData.seccion || "",
                representante: formData.representante || "",
                telefono: formData.telefono || "",
                email: formData.email || "",
                direccion: formData.direccion || "",
                estado: formData.estado as "activo" | "inactivo" | "suspendido",
                promedio: 0,
                incidencias: 0,
            };
            setEstudiantes([...estudiantes, newEstudiante]);
        }

        resetForm();
    };

    const handleDelete = () => {
        if (selectedStudent) {
            setEstudiantes(estudiantes.filter(est => est.id !== selectedStudent.id));
            setShowDeleteModal(false);
            setSelectedStudent(null);
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingStudent(null);
        setFormData({
            cedula: "",
            nombre: "",
            apellido: "",
            fechaNacimiento: "",
            grado: "",
            seccion: "",
            representante: "",
            telefono: "",
            email: "",
            direccion: "",
            estado: "activo",
        });
    };

    const editStudent = (student: Estudiante) => {
        setEditingStudent(student);
        setFormData(student);
        setShowModal(true);
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "activo": return "bg-green-100 text-green-700";
            case "inactivo": return "bg-gray-100 text-gray-700";
            case "suspendido": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case "activo": return <CheckCircle size={14} />;
            case "suspendido": return <AlertCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Gestión de Estudiantes</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Total: {filteredEstudiantes.length} estudiantes • Activos: {estudiantes.filter(e => e.estado === "activo").length}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingStudent(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <UserPlus size={18} />
                    Inscribir Nuevo Estudiante
                </button>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido, cédula o representante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
                    >
                        <span>Filtros</span>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {(selectedGrado ? 1 : 0) + (selectedEstado ? 1 : 0)}
                        </span>
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2.5 rounded-xl transition ${viewMode === "table" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            <Table2 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2.5 rounded-xl transition ${viewMode === "grid" ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            <Grid3x3 size={18} />
                        </button>
                    </div>
                </div>

                {/* Filtros expandibles */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Grado</label>
                            <select
                                value={selectedGrado}
                                onChange={(e) => setSelectedGrado(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-500"
                            >
                                <option value="">Todos</option>
                                {grados.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Estado</label>
                            <select
                                value={selectedEstado}
                                onChange={(e) => setSelectedEstado(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-500"
                            >
                                <option value="">Todos</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                                <option value="suspendido">Suspendido</option>
                            </select>
                        </div>
                        {(selectedGrado || selectedEstado) && (
                            <button
                                onClick={() => { setSelectedGrado(""); setSelectedEstado(""); }}
                                className="text-green-600 text-sm hover:text-green-700 self-end"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Vista de Tabla */}
            {viewMode === "table" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cédula</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grado/Sección</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Representante</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Promedio</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedEstudiantes.map((est) => (
                                    <tr key={est.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {est.nombre.charAt(0)}{est.apellido.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{est.nombre} {est.apellido}</p>
                                                    <p className="text-xs text-gray-400">{est.edad} años</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{est.cedula}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-800">{est.grado}</span>
                                            <span className="text-gray-400 ml-1">- Sección {est.seccion}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{est.representante}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{est.telefono}</p>
                                            <p className="text-xs text-gray-400">{est.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${est.promedio}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium">{est.promedio}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(est.estado)}`}>
                                                {getEstadoIcon(est.estado)}
                                                {est.estado === "activo" ? "Activo" : est.estado === "inactivo" ? "Inactivo" : "Suspendido"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => editStudent(est)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(est);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredEstudiantes.length)} de {filteredEstudiantes.length}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 bg-blue-900 text-white rounded-lg">{currentPage}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Vista de Grid */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedEstudiantes.map((est) => (
                        <div key={est.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                                        {est.nombre.charAt(0)}{est.apellido.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{est.nombre} {est.apellido}</p>
                                        <p className="text-blue-200 text-xs">{est.grado} - Sección {est.seccion}</p>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <button className="p-1 text-white/80 hover:text-white">
                                        <MoreVertical size={16} />
                                    </button>
                                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                        <button
                                            onClick={() => editStudent(est)}
                                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-t-lg"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedStudent(est);
                                                setShowDeleteModal(true);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap size={16} className="text-gray-400" />
                                    <span className="text-gray-600">Cédula:</span>
                                    <span className="text-gray-800">{est.cedula}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User size={16} className="text-gray-400" />
                                    <span className="text-gray-600">Representante:</span>
                                    <span className="text-gray-800 truncate">{est.representante}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone size={16} className="text-gray-400" />
                                    <span className="text-gray-600">Teléfono:</span>
                                    <span className="text-gray-800">{est.telefono}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-gray-600">Edad:</span>
                                    <span className="text-gray-800">{est.edad} años</span>
                                </div>
                                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-gray-400" />
                                        <span className="text-sm font-medium text-blue-900">{est.promedio}%</span>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(est.estado)}`}>
                                        {getEstadoIcon(est.estado)}
                                        {est.estado === "activo" ? "Activo" : est.estado === "inactivo" ? "Inactivo" : "Suspendido"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Inscripción/Edición */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-blue-900">
                                {editingStudent ? "Editar Estudiante" : "Inscribir Nuevo Estudiante"}
                            </h2>
                            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                                    <input
                                        type="text"
                                        name="cedula"
                                        value={formData.cedula}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                        placeholder="V-12345678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                                    <input
                                        type="date"
                                        name="fechaNacimiento"
                                        value={formData.fechaNacimiento}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
                                    <select
                                        name="grado"
                                        value={formData.grado}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    >
                                        <option value="">Seleccionar</option>
                                        {grados.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sección *</label>
                                    <select
                                        name="seccion"
                                        value={formData.seccion}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    >
                                        <option value="">Seleccionar</option>
                                        {secciones.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Representante *</label>
                                    <input
                                        type="text"
                                        name="representante"
                                        value={formData.representante}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                        <option value="suspendido">Suspendido</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                                    {editingStudent ? "Actualizar" : "Inscribir"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={28} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar estudiante?</h3>
                            <p className="text-gray-500">
                                ¿Estás seguro de que deseas eliminar a <strong>{selectedStudent.nombre} {selectedStudent.apellido}</strong>? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
