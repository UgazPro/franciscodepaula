import { useState, useEffect, useCallback } from "react";
import TabsComponent from "@/components/tabs/TabsComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useStudentsStore } from "@/stores/students.store";
import Students from "./views/Students/Students";
import RepresentativesView from "./views/Representatives/RepresentativesView";
import RepresentativeForm from "./views/Representatives/Form/RepresentativeForm";
import TeacherAssignmentsView from "./views/TeacherAssignmentsView";
import CRPView from "./views/CRP/CRPView";
import UploadGradesManagement from "./views/UploadGradesManagement/UploadGradesManagement";
import type { IRepresentative } from "@/services/users/user.interface";

type ActiveTab = "estudiantes" | "representantes" | "asignaciones" | "crp" | "carga-notas";

const tabs = [
    { value: "estudiantes" as const, label: "Estudiantes" },
    { value: "representantes" as const, label: "Representantes" },
    { value: "asignaciones" as const, label: "Asignaciones" },
    { value: "crp" as const, label: "CRP" },
    { value: "carga-notas" as const, label: "Supervisión de Carga de Notas" },
];

export default function AcademicMonitoring() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("estudiantes");
    const [repFormMode, setRepFormMode] = useState<"create" | "edit" | null>(null);
    const [selectedRepresentative, setSelectedRepresentative] = useState<IRepresentative | null>(null);

    useEffect(() => {
        useStudentsStore.getState().clearFilters();
    }, [activeTab]);

    const tabsComponent = <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />;

    const handleRepClose = useCallback(() => {
        setRepFormMode(null);
        setSelectedRepresentative(null);
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {activeTab === "estudiantes" ? (
                <Students tabsComponent={tabsComponent} />
            ) : activeTab === "representantes" ? (
                <div className="flex-1 min-h-0">
                    <PageTransitionComponent
                        primaryChildren={
                            <>
                                {tabsComponent}
                                <RepresentativesView
                                    onCreate={() => { setRepFormMode("create"); setSelectedRepresentative(null); }}
                                    onEdit={(rep) => { setSelectedRepresentative(rep); setRepFormMode("edit"); }}
                                />
                            </>
                        }
                        secondaryChildren={
                            <RepresentativeForm
                                mode={repFormMode!}
                                selectedRepresentative={selectedRepresentative}
                                onClose={handleRepClose}
                            />
                        }
                        toggle={repFormMode !== null}
                    />
                </div>
            ) : activeTab === "asignaciones" ? (
                <div className="flex-1 min-h-0">
                    <TeacherAssignmentsView tabsComponent={tabsComponent} />
                </div>
            ) : activeTab === "crp" ? (
                <div className="flex-1 min-h-0">
                    <CRPView tabsComponent={tabsComponent} />
                </div>
            ) : activeTab === "carga-notas" ? (
                <div className="flex-1 min-h-0">
                    <UploadGradesManagement tabsComponent={tabsComponent} />
                </div>
            ) : null}
        </div>
    );
}
