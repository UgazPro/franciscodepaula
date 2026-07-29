import { UserCheck, Repeat, AlertTriangle } from "lucide-react";
import DialogComponent from "./DialogComponent";

interface EnrollmentTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "regular" | "repitiente" | "pending") => void;
}

const enrollmentTypes = [
  {
    type: "regular" as const,
    title: "Regular",
    description: "Nuevo estudiante que ingresa por primera vez al sistema escolar.",
    icon: UserCheck,
    color: "from-blue-600 to-blue-800",
    hoverColor: "hover:border-blue-400 hover:bg-blue-50",
  },
  {
    type: "repitiente" as const,
    title: "Repitiente",
    description: "Estudiante que cursa materias del año anterior junto con las nuevas.",
    icon: Repeat,
    color: "from-amber-500 to-amber-700",
    hoverColor: "hover:border-amber-400 hover:bg-amber-50",
  },
  {
    type: "pending" as const,
    title: "Materia Pendiente",
    description: "Estudiante que carries materias reprobadas del año anterior.",
    icon: AlertTriangle,
    color: "from-red-500 to-red-700",
    hoverColor: "hover:border-red-400 hover:bg-red-50",
  },
];

export default function EnrollmentTypeDialog({ open, onClose, onSelect }: EnrollmentTypeDialogProps) {
  return (
    <DialogComponent
      openDialog={open}
      onClose={onClose}
      dialogTitle="Tipo de Inscripción"
      dialogDescription="Seleccione el tipo de inscripción para el estudiante"
      className="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
        {enrollmentTypes.map((et) => (
          <button
            key={et.type}
            type="button"
            onClick={() => {
              onSelect(et.type);
              onClose();
            }}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 transition-all cursor-pointer ${et.hoverColor} hover:shadow-md`}
          >
            <div className={`p-4 bg-linear-to-br ${et.color} rounded-xl`}>
              <et.icon size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">{et.title}</p>
              <p className="text-xs text-gray-500 mt-1">{et.description}</p>
            </div>
          </button>
        ))}
      </div>
    </DialogComponent>
  );
}
