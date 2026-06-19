import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import DialogComponent from "@/components/dialog/DialogComponent";
import StudentForm from "../AcademicMonitoring/form/StudentForm";
import StudentDetailView from "./detail/StudentDetailView";
import { useStudentsStore } from "@/stores/students.store";
import StudentsHeader from "../AcademicMonitoring/views/AcademicMonitoringHeader";
import StudentsGridView from "./views/StudentsGridView";
import { useStudents } from "@/hooks/useUsers";
import StudentListView from "./views/StudentsListView";

export default function Students() {

    const { data: students = [], isLoading } = useStudents();

    const { viewMode, setViewMode, usingForm, openForm, screen, closeForm } = useStudentsStore();

    return (

        <div className="w-full h-full">

            <PageTransitionComponent

                primaryChildren={

                    <div className="space-y-6">

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Gestión de Estudiantes</h1>
                        </div>

                        {/* Vista de Tabla */}
                        {viewMode === "list" && (
                            <>
                                <StudentListView filteredStudents={students} />
                                {/* <PaginationComponent
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={estudiantes.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                /> */}
                            </>
                        )}

                        {/* Vista de Grid */}
                        {viewMode === "grid" && (
                            <StudentsGridView
                                paginatedEstudiantes={students}
                            />
                        )}

                    </div>

                }

                secondaryChildren={
                    <div>
                        {screen === "detail" && <div className="h-full overflow-y-auto"><StudentDetailView /></div>}
                        {screen === "form" && <StudentForm />}
                    </div>
                }

                toggle={screen === "detail" || screen === "form"}

            />

        </div>

    );
}
