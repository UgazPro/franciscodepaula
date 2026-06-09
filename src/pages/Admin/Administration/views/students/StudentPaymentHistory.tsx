import { ArrowLeft, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { usePayments } from "@/hooks/usePayments";
import { useSchoolYears, useActiveSchoolYear } from "@/hooks/useSchoolYears";
import type { IStudent, StudentEnrollment } from "@/services/users/user.interface";
import type { PaymentResponse } from "@/services/administration/payments.types";
import { paymentColumns } from "@/services/administration/payments.tables";
import { TableComponent } from "@/components/table/TableComponent";
import { useDeletePayment } from "@/queries/usePaymentMutations";

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

  useEffect(() => {
    if (activeSchoolYear && selectedSchoolYearId === null) {
      setSelectedSchoolYearId(activeSchoolYear.id);
    }
  }, [activeSchoolYear, selectedSchoolYearId]);

  const { data: payments = [], isLoading: paymentsLoading } = usePayments({
    studentId: student.id,
    schoolYearId: selectedSchoolYearId ?? undefined,
  } as any);

  const columns = useMemo(() => paymentColumns({ onDelete: (id) => deletePayment(id) }), [deletePayment]);

  const representative = getRepresentativeInfo(student);

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--blueColor) hover:text-(--darkBlueColor) transition mb-4 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver a estudiantes
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {student.person.firstNames.charAt(0)}{student.person.lastNames.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{student.person.firstNames} {student.person.lastNames}</h2>
            <p className="text-sm text-gray-400">{student.person.identificationNumber}</p>
            <p className="text-sm text-gray-500">
              Grado: {getCurrentGradeSection(student, selectedSchoolYearId)}
              {selectedSchoolYearId && schoolYears.length > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  ({((schoolYears as any[]).find((sy: any) => sy.id === selectedSchoolYearId)?.name ?? "")})
                </span>
              )}
            </p>
            {representative && (
              <p className="text-sm text-gray-500">
                Representante: {representative.name} ({representative.ci})
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Año Escolar:</label>
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

      {paymentsLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando pagos...
        </div>
      ) : (payments as PaymentResponse[]).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No se encontraron pagos para este estudiante en el año escolar seleccionado.
        </div>
      ) : (
        <TableComponent
          data={payments as PaymentResponse[]}
          columns={columns}
        />
      )}
    </div>
  );
}
