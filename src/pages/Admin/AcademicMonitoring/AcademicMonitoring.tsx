import { useState } from "react";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import StudentDetailView from "../Students/detail/StudentDetailView";
import { useStudentsStore } from "@/stores/students.store";
import { useStudents } from "@/hooks/useUsers";
import StudentListView from "../Students/views/StudentsListView";
import AcademicMonitoringHeader from "./views/AcademicMonitoringHeader";
import { useFilteredStudents } from "@/hooks/useFilteredStudents";
import { EnrollmentForm } from "./form/EnrollmentForm";
import WizardDialogComponent from "@/components/dialog/WizardDialogComponent";
import StudentsNoResults from "../Students/views/StudentNoResultsView";

export default function AcademicMonitoring() {

    const { data: students = [], isLoading } = useStudents();
    const filteredStudents = useFilteredStudents(students);

    const [view, setView] = useState("students");

    const { usingForm, openForm, screen, finishForm, mode, step, setStep, totalSteps, closeForm } = useStudentsStore();

    return (

        <div className="w-full h-full">

            <PageTransitionComponent

                primaryChildren={

                    <div className="space-y-6">

                        {/* Header de la sección */}
                        <AcademicMonitoringHeader
                            openCreateStudent={openForm}
                            view={view}
                            setView={setView}
                        />

                        {/* <DialogComponent
                            openDialog={usingForm}
                            onClose={finishForm}
                            dialogTitle={mode === "create" ? "Agregar Estudiante" : "Editar Estudiante"}
                            children={<EnrollmentForm open={usingForm} onClose={finishForm} onSubmit={handleWizardSubmit} />}
                            className="max-w-6xl"
                            dialogDescription="Complete los campos para agregar un nuevo estudiante a la institución"
                        /> */}

                        <WizardDialogComponent
                            openDialog={usingForm}
                            onClose={closeForm}
                            title="Inscripción de Estudiante"
                            description="Complete los datos del estudiante"
                            step={step}
                            totalSteps={totalSteps}
                            showFooter={false}
                        >
                            <EnrollmentForm
                                open={usingForm}
                                onClose={finishForm}
                                step={step}
                                setStep={setStep}
                            />
                        </WizardDialogComponent>

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

                                {/* View if no results are found */}
                                {filteredStudents.length === 0 && <StudentsNoResults openCreateStudent={openForm} />}
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
