import SearchFilterComponent from "@/components/filters/SearchFilter";
import type { ViewMode } from "@/services/users/user.interface";
import { useStudentsStore } from "@/stores/students.store";
import { UserPlus } from "lucide-react";

interface StudentsHeaderProps {
    viewMode?: ViewMode;
    setViewMode?: (view: ViewMode) => void;
    openCreateStudent: () => void;
}

export default function AcademicMonitoringHeader({ viewMode, setViewMode, openCreateStudent }: StudentsHeaderProps) {

    const { searchTerm, setSearchTerm } = useStudentsStore();

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Gestión de Estudiantes</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <SearchFilterComponent
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeHolder="Buscar por nombre, apellido, cédula o email..."
                    width="w-92"
                />
                <button
                    onClick={openCreateStudent}
                    className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <UserPlus size={18} />
                    Inscribir Nuevo Estudiante
                </button>
            </div>
        </div>
    );
}
