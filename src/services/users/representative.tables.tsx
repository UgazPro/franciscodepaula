import type { Column } from "@/components/table/TableComponent";
import type { IRepresentative } from "./user.interface";
import { Pencil } from "lucide-react";

export const representativeColumns = (onEdit?: (rep: IRepresentative) => void): Column<IRepresentative>[] => [
  {
    header: "Representante",
    render: (rep) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {rep.person.firstNames.charAt(0)}
          {rep.person.lastNames.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {rep.person.firstNames} {rep.person.lastNames}
          </p>
        </div>
      </div>
    ),
  },
  {
    header: "Cédula",
    render: (rep) => (
      <span className="font-mono text-gray-800">{rep.person.identificationNumber}</span>
    ),
  },
  {
    header: "Email",
    render: (rep) => (
      <span className="text-gray-600">{rep.email}</span>
    ),
  },
  {
    header: "Teléfono",
    render: (rep) => (
      <span className="text-gray-600">{rep.phone ?? "—"}</span>
    ),
  },
  {
    header: "Ocupación",
    render: (rep) => (
      <span className="text-gray-600">{rep.occupation ?? "—"}</span>
    ),
  },
  {
    header: "Alumnos",
    render: (rep) => (
      <span className="font-medium text-gray-800">{rep.studentCount}</span>
    ),
  },
  {
    header: "Estado",
    render: (rep) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          rep.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {rep.status ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    header: "Acciones",
    render: (rep) => (
      <button
        type="button"
        onClick={() => onEdit?.(rep)}
        className="p-2 text-(--blueColor) hover:bg-(--blueColor)/10 rounded-lg transition cursor-pointer"
      >
        <Pencil size={16} />
      </button>
    ),
  },
];
