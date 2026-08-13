import { GraduationCap } from "lucide-react";
import DialogComponent from "@/components/dialog/DialogComponent";
import type { MomentType } from "@/hooks/useNewsletters";

interface MomentModalProps {
  open: boolean;
  onSelect: (moment: MomentType) => void;
}

const moments: { value: MomentType; label: string; description: string }[] = [
  { value: "I", label: "Momento I", description: "Notas definitivas del primer lapso" },
  { value: "II", label: "Momento II", description: "Notas definitivas del segundo lapso" },
  { value: "III", label: "Momento III", description: "Notas definitivas del tercer lapso" },
];

export default function MomentModal({ open, onSelect }: MomentModalProps) {
  return (
    <DialogComponent
      openDialog={open}
      onClose={() => {}}
      dialogTitle="Seleccionar Momento"
      dialogDescription="Seleccione el momento académico para visualizar los boletines"
      className="max-w-md"
    >
      <div className="grid grid-cols-1 gap-3 mt-4">
        {moments.map((m) => (
          <button
            key={m.value}
            onClick={() => onSelect(m.value)}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-(--blueColor) hover:bg-blue-50 transition cursor-pointer group"
          >
            <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition">
              <GraduationCap size={24} className="text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">{m.label}</p>
              <p className="text-xs text-gray-500">{m.description}</p>
            </div>
          </button>
        ))}
      </div>
    </DialogComponent>
  );
}
