import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import DialogComponent from "@/components/dialog/DialogComponent";
import StudentForm from "./form/StudentForm";
import StudentDetailView from "./detail/StudentDetailView";
import { useStudentsStore } from "@/stores/students.store";
import StudentsHeader from "./views/StudentsHeader";
import StudentsGridView from "./views/StudentsGridView";
import { useStudents } from "@/hooks/useUsers";
import StudentListView from "./views/StudentsListView";

export default function Students() {

    const { data: students = [], isLoading } = useStudents();

    const { viewMode, setViewMode, usingForm, openForm, screen, finishForm } = useStudentsStore();

    return (

        <div className="w-full h-full">

            <PageTransitionComponent

                primaryChildren={

                    <div className="space-y-6">

                        {/* Header de la sección */}
                        <StudentsHeader
                            openCreateStudent={openForm}
                        />

                        <DialogComponent
                            openDialog={usingForm}
                            onClose={finishForm}
                            dialogTitle="Nuevo Estudiante"
                            children={<StudentForm />}
                            className="max-w-6xl"
                            dialogDescription="Complete los campos para agregar un nuevo estudiante a la institución"
                        />

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
                    </div>
                }

                // toggle={screen === "detail" ? true : false}
                toggle={false}

            />

        </div>

    );
}
