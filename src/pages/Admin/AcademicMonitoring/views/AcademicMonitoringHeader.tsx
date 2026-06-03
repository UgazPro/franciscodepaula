import SearchFilterComponent from "@/components/filters/SearchFilter";
import { useStudentsStore } from "@/stores/students.store";
import { UserPlus } from "lucide-react";

export default function AcademicMonitoringHeader() {
    const searchTerm = useStudentsStore((s) => s.searchTerm);
    const setSearchTerm = useStudentsStore((s) => s.setSearchTerm);

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                <SearchFilterComponent
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeHolder="Buscar por nombre, apellido o cédula..."
                    width="w-92"
                />
                <button
                    onClick={() => useStudentsStore.getState().startCreate()}
                    className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium cursor-pointer"
                >
                    <UserPlus size={18} />
                    Inscribir Nuevo Estudiante
                </button>
            </div>
        </div>
    );
}
