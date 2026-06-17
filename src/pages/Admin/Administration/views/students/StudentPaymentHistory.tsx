import { ArrowLeft, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { usePayments } from "@/hooks/usePayments";
import { useSchoolYears, useActiveSchoolYear } from "@/hooks/useSchoolYears";
import type { IStudent, StudentEnrollment } from "@/services/users/user.interface";
import type { PaymentResponse } from "@/services/administration/payments.types";
import { paymentColumns } from "@/services/administration/payments.tables";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import { useDeletePayment } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";
import { useAdministrationStore } from "@/stores/administration.store";

interface Props {
  student: IStudent;
  onBack: () => void;
}

function getCurrentGradeSection(student: IStudent, schoolYearId?: number | null): string {
  const enrollments = (student.enrollments ?? []) as StudentEnrollment[];
  const filtered = schoolYearId
    ? enrollments.filter((e) => e.schoolYearId === schoolYearId)
    : enrollments.filter((e) => e.status);
  const enrollment = filtered[0];
  if (!enrollment) return "—";
  return `${enrollment.section.highSchoolLevel.level} "${enrollment.section.section}"`;
}

function getRepresentativeInfo(student: IStudent): { name: string; ci: string } | null {
  const rep = (student.representatives ?? [])[0] as any;
  if (!rep) return null;
  const p = rep.representative?.user?.person;
  if (!p) return null;
  return { name: `${p.firstNames} ${p.lastNames}`, ci: p.identificationNumber ?? "" };
}

export default function StudentPaymentHistory({ student, onBack }: Props) {
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { data: schoolYears = [] } = useSchoolYears();
  const { mutateAsync: deletePayment } = useDeletePayment();

  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    if (activeSchoolYear && selectedSchoolYearId === null) {
      setSelectedSchoolYearId(activeSchoolYear.id);
    }
  }, [activeSchoolYear, selectedSchoolYearId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const { data: payments = [], isLoading: paymentsLoading } = usePayments({
    studentId: student.id,
    schoolYearId: selectedSchoolYearId ?? undefined,
  } as any);

  const paymentList = payments as PaymentResponse[];

  const totalPages = Math.ceil(paymentList.length / itemsPerPage);
  const paginatedPayments = useMemo(
    () => paymentList.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ),
    [paymentList, currentPage, itemsPerPage],
  );

  const { selectPayment, setMode, setScreen } = usePaymentsStore();
  const { setActiveTab } = useAdministrationStore();

  const handleEdit = useCallback((payment: PaymentResponse) => {
    selectPayment(payment);
    setMode("edit");
    setActiveTab("pagos");
    setScreen("form");
  }, [selectPayment, setMode, setActiveTab, setScreen]);

  const columns = useMemo(
    () => paymentColumns({
      onDelete: (id) => deletePayment(id),
      onEdit: handleEdit,
    }),
    [deletePayment, handleEdit],
  );

  const representative = getRepresentativeInfo(student);

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--blueColor) hover:text-(--darkBlueColor) transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver a estudiantes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {student.person.firstNames.charAt(0)}{student.person.lastNames.charAt(0)}
            </div>
            <div className="flex gap-x-4 gap-y-1 text-sm">
              <>
                <span className="text-gray-400">Nombre:</span>
                <span className="text-gray-800 font-medium truncate">{student.person.firstNames} {student.person.lastNames}</span>
                <span className="text-gray-400">C.I.:</span>
                <span className="text-gray-800">{student.person.identificationNumber}</span>
              </>
              <>
                <span className="text-gray-400">Grado:</span>
                <span className="text-gray-800">{getCurrentGradeSection(student, selectedSchoolYearId)}</span>
                {representative && (
                  <>
                    <span className="text-gray-400">Representante:</span>
                    <span className="text-gray-800 truncate">{representative.name} ({representative.ci})</span>
                  </>
                )}
              </>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Año Escolar:</label>
              <select
                value={selectedSchoolYearId ?? ""}
                onChange={(e) => setSelectedSchoolYearId(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
              >
                {(schoolYears as any[]).map((sy: any) => (
                  <option key={sy.id} value={sy.id}>
                    {sy.name} {sy.isActive ? "(Actual)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {paymentsLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando pagos...
        </div>
      ) : paymentList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No se encontraron pagos para este estudiante en el año escolar seleccionado.
        </div>
      ) : (
        <>
          <TableComponent
            data={paginatedPayments}
            columns={columns}
          />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={paymentList.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        </>
      )}
    </div>
  );
}
