import type { Column } from "@/components/table/TableComponent";
import type { GradeStudentRow, GradeEvaluation } from "./grade.types";
import { TooltipComponent } from "@/components/tooltip/TooltipComponent";

export function gradeColumns(
  evaluations: GradeEvaluation[],
  onGradeChange: (studentId: number, evaluationId: number, value: string) => void,
): Column<GradeStudentRow>[] {
  const baseColumns: Column<GradeStudentRow>[] = [
    {
      header: "#",
      render: (_row, index) => (
        <span className="text-gray-500 text-sm">{(index ?? 0) + 1}</span>
      ),
      headerClassName: "w-12",
      className: "w-12",
    },
    {
      header: "Cédula",
      accessor: "identificationNumber",
      className: "text-sm text-gray-600",
    },
    {
      header: "Apellidos",
      accessor: "lastNames",
      className: "text-sm font-medium text-gray-800",
    },
    {
      header: "Nombres",
      accessor: "firstNames",
      className: "text-sm text-gray-700",
    },
  ];

  const evalColumns: Column<GradeStudentRow>[] = evaluations.map((ev, idx) => ({
    header: `EVA ${idx + 1} (${ev.percentage}%)`,
    render: (row) => {
      const currentVal = row.grades[ev.id];
      return (
        <input
          type="number"
          min={0}
          max={20}
          step="0.1"
          value={currentVal ?? ""}
          onChange={(e) => onGradeChange(row.id, ev.id, e.target.value)}
          className="w-12 h-8 px-1 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-(--blueColor) bg-white"
          placeholder="—"
        />
      );
    },
    renderHeader: () => (
      <TooltipComponent content={`${ev.topic} (${ev.evaluationType.evaluationType})`}>
        <span className="cursor-default">EVA {idx + 1} ({ev.percentage}%)</span>
      </TooltipComponent>
    ),
    headerClassName: "text-center min-w-[70px]",
    className: "text-center",
  }));

  const definitivaColumn: Column<GradeStudentRow>[] = [
    {
      header: "Definitiva",
      render: (row) => (
        <span className={`text-sm font-bold ${row.hasMissingGrades ? "text-gray-400" : row.definitiva >= 10 ? "text-green-600" : "text-gray-800"}`}>
          {row.hasMissingGrades ? "—" : row.definitiva > 0 ? row.definitiva.toFixed(1) : "—"}
        </span>
      ),
      headerClassName: "text-center",
      className: "text-center",
    },
  ];

  return [...baseColumns, ...evalColumns, ...definitivaColumn];
}
