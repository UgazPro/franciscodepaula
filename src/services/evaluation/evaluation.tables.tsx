import type { Column } from "@/components/table/TableComponent";
import type { EvaluationResponse } from "./evaluation.types";
import { Pencil } from "lucide-react";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";

interface EvaluationColumnsProps {
  onEdit?: (evaluation: EvaluationResponse) => void;
  onDelete?: (id: number) => void;
}

export const evaluationColumns = ({ onEdit, onDelete }: EvaluationColumnsProps = {}): Column<EvaluationResponse>[] => [
  {
    header: "Tema",
    render: (row) => (
      <span className="font-medium text-gray-800">{row.topic}</span>
    ),
  },
  {
    header: "Tipo",
    render: (row) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        {row.evaluationType.evaluationType}
      </span>
    ),
  },
  {
    header: "Ponderación",
    render: (row) => (
      <span className="text-gray-700">{Number(row.percentage)}%</span>
    ),
  },
  {
    header: "Puntos",
    render: (row) => (
      <span className="text-gray-700 font-medium">
        {((Number(row.percentage) / 100) * 20).toFixed(0)}
      </span>
    ),
  },
  {
    header: "Fecha",
    render: (row) => (
      <span className="text-gray-600">
        {row.dueDate
          ? new Date(row.dueDate).toLocaleDateString("es-VE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </span>
    ),
  },
  {
    header: "Acciones",
    headerClassName: "text-center",
    className: "text-center",
    render: (row) => (
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit?.(row); }}
          className="p-2 text-(--blueColor) hover:bg-(--blueColor)/10 rounded-lg transition cursor-pointer"
        >
          <Pencil size={16} />
        </button>
        {onDelete && (
          <DeleteDialog
            preposition="la"
            whatsDeleting={`evaluación "${row.topic}"`}
            onConfirm={() => { onDelete(row.id); }}
            buttonType="ghost"
            buttonStyles="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
            confirmText="Eliminar"
            title={`¿Eliminar evaluación?`}
            description="Si esta evaluación no tiene notas asociadas, se eliminará permanentemente."
          />
        )}
      </div>
    ),
  },
];
