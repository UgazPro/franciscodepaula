import { useState, useMemo, useEffect, useCallback } from "react";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useStudentsStore } from "@/stores/students.store";
import { useStudents } from "@/hooks/useUsers";
import StudentListView from "./StudentsListView";
import StudentDetailView from "./details/StudentDetailView";
import AcademicMonitoringHeader from "../AcademicMonitoringHeader";
import { EnrollmentForm } from "../../form/EnrollmentForm";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import StudentsNoResults from "./StudentNoResultsView";
import PdfExportButton from "@/components/pdf/PdfExportButton";
import type { EnrollmentFormValues } from "../../form/enrollment/enrollment.schema";
import type { IStudent } from "@/services/users/user.interface";
import type { PaginatedResponse } from "@/services/users/user.service";

interface StudentsProps {
    tabsComponent?: React.ReactNode;
}

export default function Students({ tabsComponent }: StudentsProps) {
    const {
        screen, searchTerm, mode, selectedStudent, step, setStep, closeForm,
        filterView, filterLevelId, filterSection, filterGender,
        filterAgeMode, filterAgeMin, filterAgeMax, filterAgeExact,
    } = useStudentsStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filterKey = `${searchTerm}|${filterView}|${filterLevelId}|${filterSection}|${filterGender}|${filterAgeMin}|${filterAgeMax}|${filterAgeExact}|${itemsPerPage}`;
    const [pageFilterKey, setPageFilterKey] = useState(filterKey);
    const effectivePage = filterKey === pageFilterKey ? currentPage : 1;

    const handlePageChange = useCallback((page: number) => {
        setPageFilterKey(filterKey);
        setCurrentPage(page);
    }, [filterKey]);

    const commonFilters = {
        view: filterView,
        levelId: filterLevelId ?? undefined,
        section: filterSection ?? undefined,
        gender: filterGender ?? undefined,
        ageMin: filterAgeMode === "range" ? (filterAgeMin ?? undefined) : undefined,
        ageMax: filterAgeMode === "range" ? (filterAgeMax ?? undefined) : undefined,
        ageExact: filterAgeMode === "exact" ? (filterAgeExact ?? undefined) : undefined,
    };

    const { data: paginatedResult, isLoading } = useStudents({
        ...commonFilters,
        search: searchTerm,
        page: effectivePage,
        take: itemsPerPage,
    });

    const { data: allStudentsResult } = useStudents({
        ...commonFilters,
        search: searchTerm,
    });

    const paginatedData = (paginatedResult as PaginatedResponse<IStudent> | undefined);
    const students = paginatedData?.data ?? [];
    const paginationMeta = paginatedData?.meta;
    const filteredStudents = Array.isArray(allStudentsResult) ? allStudentsResult : (allStudentsResult as { data: IStudent[] } | undefined)?.data ?? [];

    useEffect(() => {
        useStudentsStore.getState().closeForm();
        useStudentsStore.getState().clearFilters();
    }, []);

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
            representativeFirstNames: rep?.user?.person?.firstNames ?? "",
            representativeLastNames: rep?.user?.person?.lastNames ?? "",
            representativeIdentification: rep?.user?.person?.identificationNumber ?? "",
            representativeBirthDate: rep?.user?.person?.birthDate ? new Date(rep.user.person.birthDate) : new Date(),
            representativeGender: rep?.user?.person?.gender ?? "",
            representativeEmail: rep?.user?.email ?? "",
            representativePhone: rep?.user?.phone ?? "",
            representativeRelation: studentRep?.relationship ?? "",
            representativeProfession: rep?.occupation ?? "",
            schoolYearId: enrollment?.schoolYearId ?? undefined,
            levelId: enrollment?.section?.highSchoolLevel?.id ?? undefined,
            sectionId: enrollment?.sectionId ?? undefined,
            enrollmentDate: enrollment?.enrollmentDate ? new Date(enrollment.enrollmentDate) : new Date(),
        };
    }, [mode, selectedStudent]);

    const isFormOpen = screen === "form";
    const isDetailOpen = screen === "detail";

    return (
        <div className="flex-1 min-h-0">
            <PageTransitionComponent
                primaryChildren={
                    <>
                        {tabsComponent}
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
                                        onPageChange={handlePageChange}
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
    );
}
