import { Check, X, Loader2, Pencil, Power, Trash2 } from "lucide-react";
import type { Column } from "@/components/table/TableComponent";
import type { TeacherAssignmentResponse, SubjectData, SpecialGroupResponse, CRPStudentResponse, AvailableStudentResponse } from "./teacher-assignment.types";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";

export const teacherAssignmentColumns = (
  onEdit?: (assignment: TeacherAssignmentResponse) => void
): Column<TeacherAssignmentResponse>[] => [
  {
    header: "Docente",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
          {row.employee.user.person.firstNames.charAt(0)}
          {row.employee.user.person.lastNames.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {row.employee.user.person.firstNames} {row.employee.user.person.lastNames}
          </p>
          <p className="text-xs text-gray-400">{row.employee.user.person.identificationNumber}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Materia",
    render: (row) => (
      <span className="font-medium text-gray-800">{row.levelSubject.subject.subject}</span>
    ),
  },
  {
    header: "Nivel / Sección",
    render: (row) => (
      <span className="text-gray-600">
        {row.section.highSchoolLevel.level} — {row.section.section}
      </span>
    ),
  },
  {
    header: "Estado",
    render: (row) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {row.status ? "Activa" : "Inactiva"}
      </span>
    ),
  },
  {
    header: "Acciones",
    headerClassName: "text-right",
    className: "text-right",
    render: (row) => (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
        className="p-2 text-(--blueColor) hover:bg-(--blueColor)/10 rounded-lg transition cursor-pointer"
      >
        <Pencil size={16} />
      </button>
    ),
  },
];

export const buildSectionColumns = (
  sectionId: number,
  processingIds: Set<string>,
  assigningSubject: { sectionId: number; levelSubjectId: number } | null,
  teacherOptions: { id: number; name: string; idNumber: string }[],
  onTeacherChange: (sectionId: number, levelSubjectId: number, teacherId: number) => void,
  onAssigningSubject: (val: { sectionId: number; levelSubjectId: number } | null) => void,
): Column<SubjectData>[] => [
  {
    header: "Materia",
    className: "font-medium text-gray-800",
    render: (row) => (
      <div>
        <p className="text-sm font-medium text-gray-800">{row.subject}</p>
        {row.subjectCode && (
          <p className="text-xs text-gray-400">{row.subjectCode}</p>
        )}
      </div>
    ),
  },
  {
    header: "Docente",
    render: (row) => {
      if (row.assignment) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <Check size={12} />
            {row.assignment.teacherName}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
          <X size={12} />
          Sin asignar
        </span>
      );
    },
  },
  {
    header: "Acciones",
    headerClassName: "text-right",
    className: "text-right",
    render: (row) => {
      const key = `${sectionId}-${row.levelSubjectId}`;
      const isProcessing = processingIds.has(key);
      const isAssigning = assigningSubject?.sectionId === sectionId && assigningSubject?.levelSubjectId === row.levelSubjectId;

      if (isProcessing) {
        return <Loader2 size={16} className="animate-spin text-gray-400 mx-auto" />;
      }

      if (isAssigning) {
        return (
          <select
            autoFocus
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-(--blueColor) min-w-[140px]"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                onTeacherChange(sectionId, row.levelSubjectId, Number(val));
              }
            }}
            onBlur={() => onAssigningSubject(null)}
          >
            <option value="" disabled>Seleccionar...</option>
            {teacherOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.idNumber}
              </option>
            ))}
          </select>
        );
      }

      return (
        <button
          type="button"
          onClick={() => onAssigningSubject({ sectionId, levelSubjectId: row.levelSubjectId })}
          className="text-xs px-3 py-1.5 rounded-lg border border-(--blueColor)/30 text-(--blueColor) hover:bg-(--blueColor)/5 transition cursor-pointer"
        >
          {row.assignment ? "Cambiar" : "Asignar"}
        </button>
      );
    },
  },
];

export const specialGroupColumns = (
  onEdit: (row: SpecialGroupResponse) => void,
  onToggleStatus: (row: SpecialGroupResponse) => void,
): Column<SpecialGroupResponse>[] => [
  {
    header: "CRP",
    render: (row) => (
      <span className="font-medium text-gray-800">{row.groupName}</span>
    ),
  },
  {
    header: "Profesor",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
          {row.employee.user.person.firstNames.charAt(0)}
          {row.employee.user.person.lastNames.charAt(0)}
        </div>
        <span className="text-sm text-gray-700">
          {row.employee.user.person.firstNames} {row.employee.user.person.lastNames}
        </span>
      </div>
    ),
  },
  {
    header: "Estado",
    render: (row) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {row.status ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    header: "Acciones",
    headerClassName: "text-right",
    className: "text-right",
    render: (row) => (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(row); }}
          className="p-2 text-gray-500 hover:text-(--blueColor) hover:bg-blue-50 rounded-lg transition cursor-pointer"
        >
          <Pencil size={16} />
        </button>
        <DeleteDialog
          preposition="el grupo"
          whatsDeleting={row.groupName}
          onConfirm={() => onToggleStatus(row)}
          buttonType="ghost"
          buttonStyles="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer"
          bigMessage={row.groupName}
          icon={<Power size={28} />}
          confirmText={row.status ? "Desactivar" : "Activar"}
          title={`${row.status ? "Desactivar" : "Activar"} ${row.groupName}?`}
          description={`¿Estás seguro de que deseas ${row.status ? "desactivar" : "activar"} ${row.groupName}? ${row.status ? "El grupo quedará inactivo pero no se eliminará permanentemente." : "El grupo volverá a estar activo."}`}
          iconBgClass={row.status ? "bg-orange-100" : "bg-green-100"}
          iconColorClass={row.status ? "text-orange-600" : "text-green-600"}
          confirmClass={row.status ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}
        />
      </div>
    ),
  },
];

export const crpStudentColumns = (
  onRemove: (studentEnrollmentId: number) => void,
): Column<CRPStudentResponse>[] => [
  {
    header: "Nombre",
    render: (row) => (
      <span className="font-medium text-gray-800">
        {row.studentEnrollment.student.person.firstNames} {row.studentEnrollment.student.person.lastNames}
      </span>
    ),
  },
  {
    header: "Cédula",
    render: (row) => (
      <span className="text-gray-600">{row.studentEnrollment.student.person.identificationNumber}</span>
    ),
  },
  {
    header: "Sección",
    render: (row) => (
      <span className="text-gray-600">
        {row.studentEnrollment.section.highSchoolLevel.level} — {row.studentEnrollment.section.section}
      </span>
    ),
  },
  {
    header: "",
    headerClassName: "text-right",
    className: "text-right",
    render: (row) => (
      <button
        onClick={() => onRemove(row.studentEnrollmentId)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
        title="Remover del CRP"
      >
        <Trash2 size={16} />
      </button>
    ),
  },
];

export const crpAvailableStudentColumns = (
  selectedEnrollments: number[],
  onToggle: (enrollmentId: number) => void,
): Column<AvailableStudentResponse>[] => [
  {
    header: "",
    className: "w-10",
    render: (row) => (
      <input
        type="checkbox"
        checked={selectedEnrollments.includes(row.id)}
        onChange={() => onToggle(row.id)}
        className="w-4 h-4 text-(--blueColor) border-gray-300 rounded focus:ring-(--blueColor) cursor-pointer"
      />
    ),
  },
  {
    header: "Nombre",
    render: (row) => (
      <span className="font-medium text-gray-800">
        {row.student.person.firstNames} {row.student.person.lastNames}
      </span>
    ),
  },
  {
    header: "Cédula",
    render: (row) => (
      <span className="text-gray-600">{row.student.person.identificationNumber}</span>
    ),
  },
  {
    header: "Sección",
    render: (row) => (
      <span className="text-gray-600">
        {row.section.highSchoolLevel.level} — {row.section.section}
      </span>
    ),
  },
];
