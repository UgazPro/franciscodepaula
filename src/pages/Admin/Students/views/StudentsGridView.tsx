import { MoreVertical, GraduationCap, User, Phone, Calendar, BookOpen } from "lucide-react";

interface StudentGridViewProps {
    paginatedEstudiantes: any;
}

export default function StudentsGridView({ paginatedEstudiantes } : StudentGridViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedEstudiantes.map((est) => (
                <div key={est.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                    <div className="bg-linear-to-r from-blue-900 to-blue-800 px-4 py-3 flex justify-between items-center">
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
                                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-t-lg"
                                >
                                    Editar
                                </button>
                                <button
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
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
