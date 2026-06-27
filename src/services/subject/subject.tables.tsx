import type { Column } from "@/components/table/TableComponent";
import type { SubjectResponse } from "./subject.types";
import { Pencil } from "lucide-react";

export const subjectColumns = (onEdit?: (subject: SubjectResponse) => void): Column<SubjectResponse>[] => [
  {
    header: "Materia",
    accessor: "subject",
    className: "font-medium text-gray-800",
  },
  {
    header: "Código",
    render: (row) => (
      <span className="font-mono text-gray-600">{row.code ?? "—"}</span>
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
