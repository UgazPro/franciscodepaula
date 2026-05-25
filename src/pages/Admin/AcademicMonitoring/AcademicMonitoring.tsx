import { useState } from "react";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import DialogComponent from "@/components/dialog/DialogComponent";
import StudentForm from "./form/StudentForm";
import StudentDetailView from "../Students/detail/StudentDetailView";
import { useStudentsStore } from "@/stores/students.store";
import { useStudents } from "@/hooks/useUsers";
import StudentListView from "../Students/views/StudentsListView";
import AcademicMonitoringHeader from "./views/AcademicMonitoringHeader";
import { useFilteredStudents } from "@/hooks/useFilteredStudents";
import { EnrollmentForm } from "./form/EnrollmentForm";
import WizardDialogComponent from "@/components/dialog/WizardDialogComponent";

export default function AcademicMonitoring() {

    const { data: students = [], isLoading } = useStudents();
    const filteredStudents = useFilteredStudents(students);

    const [ view, setView ] = useState("students");

    const { usingForm, openForm, screen, finishForm, mode } = useStudentsStore();

    const handleWizardSubmit = async (data: any) => {
        // Aquí puedes manejar la lógica de envío del formulario, como llamar a una API o actualizar el estado global
        console.log("Datos del formulario:", data);
        finishForm();
    }

    const [step, setStep] = useState(1);
    const totalSteps = 3;

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
                            onClose={finishForm}
                            title="Inscripción de Estudiante"
                            description="Complete los datos del estudiante"
                            step={step}
                            totalSteps={totalSteps}
                            onNext={() => setStep(step + 1)}
                            onBack={() => setStep(step - 1)}
                            onFinish={finishForm}
                        >
                            <EnrollmentForm
                                open={usingForm}
                                onClose={finishForm}
                                onSubmit={handleWizardSubmit}
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
