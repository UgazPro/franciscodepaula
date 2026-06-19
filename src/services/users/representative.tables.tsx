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

export const representativeExpandedRender = (rep: IRepresentative) => {
  const students = rep.students ?? [];
  if (students.length === 0) return null;

  return (
    <div className="bg-gray-50/60 mx-2 mb-2 py-4 px-7">
      <table className="w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-(--blueColor) text-white">
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Estudiante</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Cédula</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Relación</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha Nac.</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Edad</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Pagos</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Nivel / Sección</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-gray-100">
          {students.map((s) => (
            <tr key={s.id}>
              <td className="px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                    {s.firstNames.charAt(0)}{s.lastNames.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-700">{s.firstNames} {s.lastNames}</span>
                </div>
              </td>
              <td className="px-3 py-1.5 font-mono text-gray-600">{s.identificationNumber}</td>
              <td className="px-3 py-1.5 text-gray-600 capitalize">{s.relationship ?? "—"}</td>
              <td className="px-3 py-1.5 text-gray-600">{s.birthDate ? new Date(s.birthDate).toLocaleDateString() : "—"}</td>
              <td className="px-3 py-1.5 text-gray-600">{s.birthDate ? calcAge(s.birthDate) : "—"}</td>
              <td className="px-3 py-1.5 font-medium text-gray-700">{s.paymentCount}</td>
              <td className="px-3 py-1.5 text-gray-600">{s.section ?? "—"}</td>
              <td className="px-3 py-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  s.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {s.status ? "Activo" : "Inactivo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function calcAge(birth: string): number {
  const today = new Date();
  const bd = new Date(birth);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}
