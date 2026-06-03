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
import SchoolYearPanel from "./views/SchoolYearPanel";
import PdfExportButton from "@/components/pdf/PdfExportButton";
import type { EnrollmentFormValues } from "./form/enrollment/enrollment.schema";
import type { IStudent } from "@/services/users/user.interface";

type ActiveTab = "estudiantes" | "school-year";

const tabs = [
    { value: "estudiantes" as const, label: "Estudiantes" },
    { value: "school-year" as const, label: "Año Escolar" },
];

export default function AcademicMonitoring() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("estudiantes");

    const {
        screen, searchTerm, mode, selectedStudent, step, setStep, closeForm,
        filterView, filterLevelId, filterSection, filterGender,
        filterAgeMode, filterAgeMin, filterAgeMax, filterAgeExact,
    } = useStudentsStore();

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
        if (!searchTerm.trim()) return students;
        const term = searchTerm.toLowerCase();
        return (students as IStudent[]).filter((s) => {
            const fn = s.person?.firstNames?.toLowerCase() ?? "";
            const ln = s.person?.lastNames?.toLowerCase() ?? "";
            const id = s.person?.identificationNumber?.toLowerCase() ?? "";
            return fn.includes(term) || ln.includes(term) || id.includes(term);
        });
    }, [students, searchTerm]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterView, filterLevelId, filterSection, filterGender, filterAgeMin, filterAgeMax, filterAgeExact]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const formSteps = 4;

    const initialData = useMemo((): Partial<EnrollmentFormValues> | undefined => {
        if (mode !== "edit" || !selectedStudent) return undefined;

        const rep = selectedStudent.representatives?.[0]?.representative;
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
            representativeRelation: rep?.relationship ?? "",
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
            <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "estudiantes" ? (
                <div className="flex-1 min-h-0">
                    <PageTransitionComponent
                        primaryChildren={
                            <>
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
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
                                                No se encontraron estudiantes
                                            </div>
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
            ) : (
                <div className="flex-1 min-h-0">
                    <SchoolYearPanel />
                </div>
            )}
        </div>
    );
}
