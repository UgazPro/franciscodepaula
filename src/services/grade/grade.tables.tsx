import type { Column } from "@/components/table/TableComponent";
import type { GradeStudentRow, GradeEvaluation, TeacherOverview, TeacherGroupRow } from "./grade.types";
import { TooltipComponent } from "@/components/tooltip/TooltipComponent";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

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
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={currentVal ?? ""}
          onKeyDown={(e) => {
            if (["-", "e", "E", ".", ",", "+"].includes(e.key)) e.preventDefault();
          }}
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

export const teacherOverviewColumns = (): Column<TeacherOverview>[] => [
  {
    header: "Profesor",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
          {row.teacherName.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-gray-800">{row.teacherName}</p>
          <p className="text-xs text-gray-400">{row.identificationNumber}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Materias Cargadas",
    render: (row) => {
      const unloaded = row.groups.filter((g) => !g.isLoaded).map((g) => g.subject);
      const label = (
        <span className={`font-medium cursor-help ${row.loadedCount === row.totalCount ? "text-green-600" : "text-gray-700"}`}>
          {row.loadedCount}/{row.totalCount}
        </span>
      );
      if (unloaded.length === 0) return label;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{label}</TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="w-auto max-w-xs p-2.5">
              <p className="text-xs font-semibold mb-1.5">Materias sin cargar:</p>
              <ul className="space-y-1">
                {unloaded.map((subj, i) => (
                  <li key={i} className="text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {subj}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

export const teacherGroupColumns = (): Column<TeacherGroupRow>[] => [
  {
    header: "Año / Sección",
    render: (row) => (
      <span className="font-medium text-gray-800">
        {row.level} {row.section}
      </span>
    ),
  },
  {
    header: "Materia",
    render: (row) => (
      <span className="text-gray-700">{row.subject}</span>
    ),
  },
  {
    header: "Evaluaciones",
    render: (row) => (
      <span className="text-gray-700">
        {row.evaluationCount} ({row.totalPercentage.toFixed(0)}%)
      </span>
    ),
  },
  {
    header: "Notas",
    render: (row) => {
      const pct = Math.round(row.loadedPercentage);
      const barColor = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
      return (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{pct}%</span>
        </div>
      );
    },
  },
  {
    header: "Cargada",
    render: (row) => (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        row.isLoaded ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {row.isLoaded ? "Sí" : "No"}
      </span>
    ),
  },
];
