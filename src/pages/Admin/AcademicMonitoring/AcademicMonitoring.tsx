import { useState, useMemo } from "react";
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
import type { EnrollmentFormValues } from "./form/enrollment/enrollment.schema";

export default function AcademicMonitoring() {

    const { data: students = [], isLoading } = useStudents();
    const filteredStudents = useFilteredStudents(students);

    const [view, setView] = useState("students");

    const { usingForm, openForm, screen, finishForm, mode, selectedStudent, step, setStep, closeForm } = useStudentsStore();

    const formSteps = mode === "edit" ? 2 : 3;

    const initialData = useMemo((): Partial<EnrollmentFormValues> | undefined => {
        if (mode !== "edit" || !selectedStudent) return undefined;

        return {
            firstNames: selectedStudent.person.firstNames,
            lastNames: selectedStudent.person.lastNames,
            identificationNumber: selectedStudent.person.identificationNumber,
            birthDate: new Date(selectedStudent.person.birthDate),
            gender: selectedStudent.person.gender,
            profilePhoto: selectedStudent.person.profilePhoto || "",
            birthCountry: selectedStudent.birthCountry,
            state: selectedStudent.state,
            municipality: selectedStudent.municipality ?? "",
            parish: selectedStudent.parish,
            currentParish: selectedStudent.currentParish ?? "",
            address: selectedStudent.address,
            previousSchool: selectedStudent.previousSchool,
            admissionDate: new Date(selectedStudent.admissionDate),
        };
    }, [mode, selectedStudent]);

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

                        <WizardDialogComponent
                            openDialog={usingForm}
                            onClose={closeForm}
                            title={mode === "create" ? "Inscripción de Estudiante" : "Editar Estudiante"}
                            description={mode === "create" ? "Complete los datos del estudiante y representante" : "Modifique los datos del estudiante"}
                            step={step}
                            totalSteps={formSteps}
                            showFooter={false}
                        >
                            <EnrollmentForm
                                open={usingForm}
                                onClose={finishForm}
                                mode={mode}
                                selectedStudent={selectedStudent ?? undefined}
                                initialData={initialData}
                                step={step}
                                setStep={setStep}
                                totalSteps={formSteps}
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
