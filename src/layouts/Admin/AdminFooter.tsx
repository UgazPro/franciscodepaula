import { Heart, Globe, Mail, Phone, MapPin, NotepadText } from "lucide-react";

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-8">
            <div className="px-4 md:px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">

                        {/* Logo e institución */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-green-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">UEP</span>
                                </div>
                                <span className="font-semibold text-gray-800 text-sm">
                                    Francisco de Paula
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Sistema de Gestión Administrativa del colegio UEP Francisco de Paula Salazar Acosta.
                            </p>
                        </div>

                        {/* Enlaces rápidos */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Enlaces Rápidos</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="/admin" className="text-gray-500 hover:text-green-600 transition">Dashboard</a></li>
                                <li><a href="/admin/control-estudio" className="text-gray-500 hover:text-green-600 transition">Control de Estudio</a></li>
                                <li><a href="/admin/profesores" className="text-gray-500 hover:text-green-600 transition">Profesores</a></li>
                                <li><a href="/admin/estudiantes" className="text-gray-500 hover:text-green-600 transition">Estudiantes</a></li>
                            </ul>
                        </div>

                        {/* Contacto */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Contacto</h4>
                            <ul className="space-y-2 text-xs text-gray-500">
                                <li className="flex items-center gap-2">
                                    <Phone size={14} className="text-green-500" />
                                    +58 212 555 1234
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail size={14} className="text-green-500" />
                                    admin@colegio.edu.ve
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin size={14} className="text-green-500" />
                                    Caracas, Venezuela
                                </li>
                            </ul>
                        </div>

                        {/* Soporte */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Soporte</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#" className="text-gray-500 hover:text-green-600 transition">Centro de Ayuda</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-green-600 transition">Documentación</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-green-600 transition">Reportar Problema</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-green-600 transition">Sugerencias</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Barra inferior */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
                        <p>
                            © {currentYear} UEP Francisco de Paula Salazar Acosta. Todos los derechos reservados.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-green-600 transition flex items-center gap-1">
                                <Globe size={14} />
                                Sitio Web
                            </a>
                            <a href="#" className="hover:text-green-600 transition flex items-center gap-1">
                                <NotepadText size={14} />
                                GitHub
                            </a>
                            <span className="flex items-center gap-1">
                                Hecho con <Heart size={12} className="text-red-500" /> para la educación
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}