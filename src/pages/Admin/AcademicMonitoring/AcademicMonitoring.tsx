import { useState, useMemo, useEffect } from "react";
import { normalizeSearch } from "@/helpers/search";
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
import SchoolYearPanel from "./views/SchoolYearPanel";
import RepresentativesView from "./views/RepresentativesView";
import RepresentativeForm from "./views/RepresentativeForm";
import PdfExportButton from "@/components/pdf/PdfExportButton";
import type { EnrollmentFormValues } from "./form/enrollment/enrollment.schema";
import type { IStudent, IRepresentative } from "@/services/users/user.interface";

type ActiveTab = "estudiantes" | "representantes" | "school-year";

const tabs = [
    { value: "estudiantes" as const, label: "Estudiantes" },
    { value: "representantes" as const, label: "Representantes" },
    { value: "school-year" as const, label: "Año Escolar" },
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

    const { data: students = [], isLoading } = useStudents({
        view: filterView,
        levelId: filterLevelId ?? undefined,
        section: filterSection ?? undefined,
        gender: filterGender ?? undefined,
        ageMin: filterAgeMode === "range" ? (filterAgeMin ?? undefined) : undefined,
        ageMax: filterAgeMode === "range" ? (filterAgeMax ?? undefined) : undefined,
        ageExact: filterAgeMode === "exact" ? (filterAgeExact ?? undefined) : undefined,
    });

    const filteredStudents = useMemo(() => {
        const term = normalizeSearch(searchTerm);
        if (!term) return students;
        return (students as IStudent[]).filter((s) => {
            const fn = normalizeSearch(s.person?.firstNames ?? "");
            const ln = normalizeSearch(s.person?.lastNames ?? "");
            const id = normalizeSearch(s.person?.identificationNumber ?? "");
            return fn.includes(term) || ln.includes(term) || id.includes(term);
        });
    }, [students, searchTerm]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterView, filterLevelId, filterSection, filterGender, filterAgeMin, filterAgeMax, filterAgeExact, itemsPerPage]);

    useEffect(() => {
        useStudentsStore.getState().closeForm();
    }, []);

    useEffect(() => {
        useStudentsStore.getState().clearFilters();
    }, []);

    useEffect(() => {
        if (activeTab === "estudiantes") {
            useStudentsStore.getState().clearFilters();
        }
    }, [activeTab]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

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
                                    <PdfExportButton students={filteredStudents} />
                                </div>
                                {isLoading ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
                                        Cargando estudiantes...
                                    </div>
                                ) : paginatedStudents.length === 0 ? (
                                    <>
                                        {filteredStudents.length === 0 && !searchTerm ? (
                                            <StudentsNoResults openCreateStudent={() => useStudentsStore.getState().startCreate()} />
                                        ) : (
                                            <StudentsNoResults openCreateStudent={() => useStudentsStore.getState().startCreate()} />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <StudentListView filteredStudents={paginatedStudents} />
                                        <PaginationComponent
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={filteredStudents.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setCurrentPage}
                                            onItemsPerPageChange={setItemsPerPage}
                                        />
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
                    {!repFormMode && <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />}
                    <PageTransitionComponent
                        primaryChildren={
                            <div className="pr-4">
                                <RepresentativesView
                                    onCreate={() => { setRepFormMode("create"); setSelectedRepresentative(null); }}
                                    onEdit={(rep) => { setSelectedRepresentative(rep); setRepFormMode("edit"); }}
                                />
                            </div>
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
            ) : (
                <>
                    <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                    <div className="flex-1 min-h-0">
                        <SchoolYearPanel />
                    </div>
                </>
            )}
        </div>
    );
}
