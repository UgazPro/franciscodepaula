import { useState } from "react";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import DialogComponent from "@/components/dialog/DialogComponent";
import StudentForm from "./form/StudentForm";
import StudentDetailView from "../Students/detail/StudentDetailView";
import { useStudentsStore } from "@/stores/students.store";
import { useStudents } from "@/hooks/useUsers";
import StudentListView from "../Students/views/StudentsListView";
import AcademicMonitoringHeader from "./views/AcademicMonitoringHeader";
import TabsComponent from "@/components/tabs/TabsComponent";
import { useFilteredStudents } from "@/hooks/useFilteredStudents";

export default function AcademicMonitoring() {

    const { data: students = [], isLoading } = useStudents();
    const filteredStudents = useFilteredStudents(students);

    const [ view, setView ] = useState<"students" | "details">("students");

    const { usingForm, openForm, screen, finishForm } = useStudentsStore();

    return (

        <div className="w-full h-full">

            <PageTransitionComponent

                primaryChildren={

                    <div className="space-y-6">

                        <TabsComponent 
                            tabs={[
                                { label: "Estudiantes", value: "students" },
                                { label: "Detalles", value: "details" }
                            ]}
                            activeTab={view}
                            onChange={(value) => setView(value)}
                            className="w-full max-w-md"
                        />

                        {/* Header de la sección */}
                        <AcademicMonitoringHeader
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
                        {view === "students" && (
                            <>
                                <StudentListView filteredStudents={filteredStudents} />
                                {/* <PaginationComponent
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={estudiantes.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                /> */}
                            </>
                        )}


                    </div>

                }

                secondaryChildren={
                    <div>
                        {screen === "detail" && <div className="h-full overflow-y-auto"><StudentDetailView /></div>}
                    </div>
                }

                toggle={screen === "detail" ? true : false}

            />

        </div>

    );
}
