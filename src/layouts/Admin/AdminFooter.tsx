import { Mail, Phone, MapPin } from "lucide-react";

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-linear-to-br from-blue-900 via-blue-950 to-blue-900 mt-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-green-400 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-md shrink-0">
                            UEP
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-white">
                                Francisco de Paula
                            </span>
                            <p className="text-[11px] text-gray-400 leading-tight">
                                Sistema de Gestión Administrativa
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-[11px]">
                        <span className="flex items-center gap-1.5">
                            <Phone size={11} className="text-green-400 shrink-0" />
                            +58 212 555 1234
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Mail size={11} className="text-green-400 shrink-0" />
                            admin@colegio.edu.ve
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={11} className="text-green-400 shrink-0" />
                            Caracas, Venezuela
                        </span>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-3 text-center text-[11px] text-gray-500">
                    &copy; {currentYear} UEP Francisco de Paula Salazar Acosta. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
