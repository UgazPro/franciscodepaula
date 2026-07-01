import type { Column } from "@/components/table/TableComponent";
import type { IStaff } from "@/services/users/user.interface";
import { Pencil } from "lucide-react";

export const employeeColumns = (onEdit?: (employee: IStaff) => void): Column<IStaff>[] => [
  {
    header: "Empleado",
    render: (emp) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
          {emp.person.firstNames.charAt(0)}
          {emp.person.lastNames.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {emp.person.firstNames} {emp.person.lastNames}
          </p>
        </div>
      </div>
    ),
  },
  {
    header: "Cédula",
    render: (emp) => (
      <span className="font-mono text-gray-800">{emp.person.identificationNumber}</span>
    ),
  },
  {
    header: "Email",
    render: (emp) => (
      <span className="text-gray-600">{emp.email}</span>
    ),
  },
  {
    header: "Teléfono",
    render: (emp) => (
      <span className="text-gray-600">{emp.phone ?? "—"}</span>
    ),
  },
  {
    header: "Rol",
    render: (emp) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        {emp.userRoles[0]?.role.role ?? "Sin rol"}
      </span>
    ),
  },
  {
    header: "Estado",
    render: (emp) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          emp.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {emp.status ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    header: "Acciones",
    headerClassName: "text-right",
    className: "text-right",
    render: (emp) => (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onEdit?.(emp); }}
        className="p-2 text-(--blueColor) hover:bg-(--blueColor)/10 rounded-lg transition cursor-pointer"
      >
        <Pencil size={16} />
      </button>
    ),
  },
];
