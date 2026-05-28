import SearchFilterComponent from "@/components/filters/SearchFilter";
import TabsComponent from "@/components/tabs/TabsComponent";
import type { ViewMode } from "@/services/users/user.interface";
import { useStudentsStore } from "@/stores/students.store";
import { useEnrollmentsStore } from "@/stores/enrollments.store";
import { Pencil, User, UserPlus, GraduationCap } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface StudentsHeaderProps {
    viewMode?: ViewMode;
    setViewMode?: (view: ViewMode) => void;
    openCreateStudent: () => void;
    view: string;
    setView: Dispatch<SetStateAction<string>>;
}

export default function AcademicMonitoringHeader({ viewMode, setViewMode, openCreateStudent, view, setView }: StudentsHeaderProps) {

    const studentTerm = useStudentsStore((s) => s.searchTerm);
    const setStudentTerm = useStudentsStore((s) => s.setSearchTerm);
    const enrollmentTerm = useEnrollmentsStore((s) => s.searchTerm);
    const setEnrollmentTerm = useEnrollmentsStore((s) => s.setSearchTerm);

    const searchTerm = view === "enrollments" ? enrollmentTerm : studentTerm;
    const setSearchTerm = view === "enrollments" ? setEnrollmentTerm : setStudentTerm;

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

            <div>
                <TabsComponent
                    tabs={[
                        { label: "Estudiantes", value: "students", icon: <User size={18} /> },
                        { label: "Inscripciones", value: "enrollments", icon: <GraduationCap size={18} /> },
                    ]}
                    activeTab={view}
                    onChange={(value) => setView(value)}
                    className="w-full max-w-md"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <SearchFilterComponent
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeHolder="Buscar por nombre, apellido o cédula..."
                    width="w-92"
                />
                <button
                    onClick={openCreateStudent}
                    className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium cursor-pointer"
                >
                    <UserPlus size={18} />
                    Inscribir Nuevo Estudiante
                </button>
            </div>
        </div>
    );
}
