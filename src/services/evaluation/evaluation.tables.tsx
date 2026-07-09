import type { Column } from "@/components/table/TableComponent";
import type { EvaluationResponse } from "./evaluation.types";

export const evaluationColumns = (): Column<EvaluationResponse>[] => [
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
];
