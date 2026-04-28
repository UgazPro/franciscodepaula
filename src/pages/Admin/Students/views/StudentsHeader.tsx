import type { ViewMode } from "@/services/users/user.interface";
import { UserPlus } from "lucide-react";

interface StudentsHeaderProps {
    viewMode?: ViewMode;
    setViewMode?: (view: ViewMode) => void;
    openCreateStudent: () => void;
}

export default function StudentsHeader({ viewMode, setViewMode, openCreateStudent } : StudentsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Gestión de Estudiantes</h1>
            </div>
            <button
                onClick={openCreateStudent}
                className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
            >
                <UserPlus size={18} />
                Inscribir Nuevo Estudiante
            </button>
        </div>
    );
}
