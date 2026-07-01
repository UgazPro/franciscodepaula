import { useState, useMemo, useEffect } from "react";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import TabsComponent from "@/components/tabs/TabsComponent";
import { useStudentsStore } from "@/stores/students.store";
import { useStudents } from "@/hooks/useUsers";
import StudentListView from "../Students/views/StudentsListView";
import StudentDetailView from "../Students/detail/StudentDetailView";
import AcademicMonitoringHeader from "./views/AcademicMonitoringHeader";
import { EnrollmentForm } from "./form/EnrollmentForm";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import StudentsNoResults from "../Students/views/StudentNoResultsView";
import RepresentativesView from "./views/RepresentativesView";
import RepresentativeForm from "./views/RepresentativeForm";
import TeacherAssignmentsView from "./views/TeacherAssignmentsView";
import CRPView from "./views/CRP/CRPView";
import PdfExportButton from "@/components/pdf/PdfExportButton";
import type { EnrollmentFormValues } from "./form/enrollment/enrollment.schema";
import type { IStudent, IRepresentative } from "@/services/users/user.interface";

type ActiveTab = "estudiantes" | "representantes" | "asignaciones" | "crp";

const tabs = [
    { value: "estudiantes" as const, label: "Estudiantes" },
    { value: "representantes" as const, label: "Representantes" },
    { value: "asignaciones" as const, label: "Asignaciones" },
    { value: "crp" as const, label: "CRP" },
];

export default function AcademicMonitoring() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("estudiantes");

    const {
        screen, searchTerm, mode, selectedStudent, step, setStep, closeForm,
        filterView, filterLevelId, filterSection, filterGender,
        filterAgeMode, filterAgeMin, filterAgeMax, filterAgeExact,
    } = useStudentsStore();

    const [repFormMode, setRepFormMode] = useState<"create" | "edit" | null>(null);
    const [selectedRepresentative, setSelectedRepresentative] = useState<IRepresentative | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const commonFilters = {
        view: filterView,
        levelId: filterLevelId ?? undefined,
        section: filterSection ?? undefined,
        gender: filterGender ?? undefined,
        ageMin: filterAgeMode === "range" ? (filterAgeMin ?? undefined) : undefined,
        ageMax: filterAgeMode === "range" ? (filterAgeMax ?? undefined) : undefined,
        ageExact: filterAgeMode === "exact" ? (filterAgeExact ?? undefined) : undefined,
    };

    // Paginated query for the table
    const { data: paginatedResult, isLoading } = useStudents({
        ...commonFilters,
        search: searchTerm,
        page: currentPage,
        take: itemsPerPage,
    });

    // Non-paginated query for PDF export
    const { data: allStudentsResult } = useStudents({
        ...commonFilters,
        search: searchTerm,
    });

    const students = (paginatedResult as any)?.data ?? [];
    const paginationMeta = (paginatedResult as any)?.meta;
    const filteredStudents = Array.isArray(allStudentsResult) ? allStudentsResult : (allStudentsResult as any)?.data ?? [];

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterView, filterLevelId, filterSection, filterGender, filterAgeMin, filterAgeMax, filterAgeExact, itemsPerPage]);

    useEffect(() => {
        useStudentsStore.getState().closeForm();
        useStudentsStore.getState().clearFilters();
    }, []);

    useEffect(() => {
        useStudentsStore.getState().clearFilters();
    }, [activeTab]);

    const formSteps = 4;

    const initialData = useMemo((): Partial<EnrollmentFormValues> | undefined => {
        if (mode !== "edit" || !selectedStudent) return undefined;

        const studentRep = selectedStudent.representatives?.[0];
        const rep = studentRep?.representative;
        const enrollment = selectedStudent.enrollments?.[0];

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
            representativeFirstNames: rep?.user?.person?.firstNames ?? "",
            representativeLastNames: rep?.user?.person?.lastNames ?? "",
            representativeIdentification: rep?.user?.person?.identificationNumber ?? "",
            representativeBirthDate: rep?.user?.person?.birthDate ? new Date(rep.user.person.birthDate) : new Date(),
            representativeGender: rep?.user?.person?.gender ?? "",
            representativeEmail: rep?.user?.email ?? "",
            representativePhone: rep?.user?.phone ?? "",
            representativeRelation: studentRep?.relationship ?? "",
            representativeProfession: rep?.occupation ?? "",
            schoolYearId: enrollment?.schoolYearId ?? undefined as any,
            levelId: enrollment?.section?.highSchoolLevel?.id ?? undefined as any,
            sectionId: enrollment?.sectionId ?? undefined as any,
            enrollmentDate: enrollment?.enrollmentDate ? new Date(enrollment.enrollmentDate) : new Date(),
        };
    }, [mode, selectedStudent]);

    const isFormOpen = activeTab === "estudiantes" && screen === "form";
    const isDetailOpen = activeTab === "estudiantes" && screen === "detail";

    return (
        <div className="w-full h-full flex flex-col gap-4">

            {activeTab === "estudiantes" ? (
                <div className="flex-1 min-h-0">
                    <PageTransitionComponent
                        primaryChildren={
                            <>
                                <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <AcademicMonitoringHeader />
                                    </div>
                                    <PdfExportButton students={filteredStudents as IStudent[]} />
                                </div>
                                {isLoading ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
                                        Cargando estudiantes...
                                    </div>
                                ) : students.length === 0 ? (
                                    <StudentsNoResults openCreateStudent={() => useStudentsStore.getState().startCreate()} />
                                ) : (
                                    <>
                                        <StudentListView filteredStudents={students as IStudent[]} />
                                        {paginationMeta && (
                                            <PaginationComponent
                                                currentPage={paginationMeta.page}
                                                totalPages={paginationMeta.totalPages}
                                                totalItems={paginationMeta.totalCount}
                                                itemsPerPage={paginationMeta.take}
                                                onPageChange={setCurrentPage}
                                                onItemsPerPageChange={setItemsPerPage}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        }

                        secondaryChildren={
                            isDetailOpen ? (
                                <div className="h-full overflow-y-auto">
                                    <StudentDetailView />
                                </div>
                            ) : isFormOpen ? (
                                <EnrollmentForm
                                    open={isFormOpen}
                                    onClose={closeForm}
                                    mode={mode}
                                    selectedStudent={selectedStudent ?? undefined}
                                    initialData={initialData}
                                    step={step}
                                    setStep={setStep}
                                    totalSteps={formSteps}
                                />
                            ) : null
                        }

                        toggle={isDetailOpen || isFormOpen}
                    />
                </div>
            ) : activeTab === "representantes" ? (
                <div className="flex-1 min-h-0">
                    <PageTransitionComponent
                        primaryChildren={
                            <>
                                <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
                                <div className="pr-4">
                                    <RepresentativesView
                                        onCreate={() => { setRepFormMode("create"); setSelectedRepresentative(null); }}
                                        onEdit={(rep) => { setSelectedRepresentative(rep); setRepFormMode("edit"); }}
                                    />
                                </div>
                            </>
                        }
                        secondaryChildren={
                            repFormMode ? (
                                <div className="pl-4">
                                    <RepresentativeForm
                                        mode={repFormMode}
                                        selectedRepresentative={selectedRepresentative}
                                        onClose={() => { setRepFormMode(null); setSelectedRepresentative(null); }}
                                    />
                                </div>
                            ) : null
                        }
                        toggle={!!repFormMode}
                    />
                </div>
            ) : activeTab === "asignaciones" ? (
                <div className="flex-1 min-h-0">
                    <TeacherAssignmentsView tabsComponent={<TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />} />
                </div>
            ) : activeTab === "crp" ? (
                <div className="flex-1 min-h-0">
                    <CRPView tabsComponent={<TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />} />
                </div>
            ) : null
            }
        </div>
    );
}
