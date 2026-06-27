import type { Column } from "@/components/table/TableComponent";
import type { TeacherAssignmentResponse } from "./teacher-assignment.types";
import { Pencil } from "lucide-react";

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
      <span className="font-medium text-gray-800">{row.subject.subject}</span>
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
