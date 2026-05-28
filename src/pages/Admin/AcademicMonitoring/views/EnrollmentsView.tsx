import { useState, useEffect, useMemo } from "react";
import { usePendingEnrollments } from "@/hooks/usePendingEnrollments";
import { useEnrollmentsStore } from "@/stores/enrollments.store";
import { EnrollmentCard } from "./enrollment-cards/EnrollmentCard";
import { CompleteEnrollmentForm } from "./enrollment-cards/complete-enrollment/CompleteEnrollmentForm";
import WizardDialogComponent from "@/components/dialog/WizardDialogComponent";
import NoPendingEnrollmentsView from "./NoPendingEnrollmentsView";
import { PaginationComponent } from "@/components/table/PaginationComponent";

export default function EnrollmentsView() {
  const { data: pendingStudents = [], isLoading } = usePendingEnrollments();
  const { searchTerm, showCompleteModal, selectStudent, closeCompleteModal } = useEnrollmentsStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 1024 ? 6 : 4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return pendingStudents;
    return pendingStudents.filter((s: any) => {
      const fn = s.person.firstNames?.toLowerCase() ?? "";
      const ln = s.person.lastNames?.toLowerCase() ?? "";
      const id = s.person.identificationNumber?.toLowerCase() ?? "";
      return fn.includes(search) || ln.includes(search) || id.includes(search) || `${fn} ${ln}`.includes(search);
    });
  }, [pendingStudents, searchTerm]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (isLoading) return <div className="text-center py-8 text-gray-500">Cargando...</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedStudents.map((s: any) => (
          <EnrollmentCard
            key={s.id}
            student={s}
            onClick={() => selectStudent(s.id)}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && <NoPendingEnrollmentsView />}

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredStudents.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <WizardDialogComponent
        openDialog={showCompleteModal}
        onClose={() => closeCompleteModal()}
        title="Completar Inscripción"
        description="Asigne el año escolar, nivel y sección al estudiante"
        step={1}
        totalSteps={1}
        showFooter={false}
      >
        <CompleteEnrollmentForm />
      </WizardDialogComponent>
    </>
  );
}
