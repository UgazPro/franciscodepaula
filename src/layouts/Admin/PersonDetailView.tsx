import { Calendar, Mail, MapPin } from "lucide-react";
import { useSearchStore } from "@/stores/search.store";

const roleColors: Record<string, string> = {
  Administrador: "bg-purple-100 text-purple-700",
  Profesor: "bg-blue-100 text-blue-700",
  Representante: "bg-amber-100 text-amber-700",
  Coordinador: "bg-teal-100 text-teal-700",
  Secretario: "bg-pink-100 text-pink-700",
};

export default function PersonDetailView() {
  const { selectedPerson } = useSearchStore();
  const person = selectedPerson;

  if (!person) return null;

  const initials = `${person.person.firstNames.charAt(0)}${person.person.lastNames.charAt(0)}`;
  const roleLabel = person.type === "student" ? "Estudiante" : person.role ?? "—";
  const colorClass = roleColors[roleLabel] || "bg-gray-100 text-gray-700";

  return (
    <>
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 bg-linear-to-br from-(--blueColor) to-(--darkBlueColor) rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-md">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800">
            {person.person.firstNames} {person.person.lastNames}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-sm text-gray-500">
              {person.person.identificationNumber}
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-(--blueColor) mb-3">
            <Calendar size={16} />
            <span className="text-sm font-semibold text-gray-700">Información General</span>
          </div>
          <p className="text-sm text-gray-400">
            Los datos se mostrarán aquí próximamente.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-(--blueColor) mb-3">
            <Mail size={16} />
            <span className="text-sm font-semibold text-gray-700">Contacto</span>
          </div>
          <p className="text-sm text-gray-400">
            Los datos de contacto se mostrarán aquí próximamente.
          </p>
        </div>
      </div>

      {/* Placeholder section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
        <div className="flex items-center gap-2 text-(--blueColor) mb-3">
          <MapPin size={16} />
          <span className="text-sm font-semibold text-gray-700">Actividad Reciente</span>
        </div>
        <p className="text-sm text-gray-400">
          No hay actividad reciente para mostrar.
        </p>
      </div>
    </>
  );
}
