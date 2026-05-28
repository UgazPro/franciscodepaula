import { GraduationCap } from "lucide-react";

export default function NoPendingEnrollmentsView() {
  return (
    <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-linear-to-b from-white to-gray-50">
      <GraduationCap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        No hay estudiantes pendientes
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Todos los estudiantes con matrícula pagada ya han sido asignados a una sección.
      </p>
    </div>
  );
}
