import { useState, useMemo, useCallback } from "react";
import { Loader2, AlertTriangle, Save } from "lucide-react";
import toast from "react-hot-toast";
import { ToastMessage } from "@/components/toast/ToastMessage";
import { useUserData } from "@/helpers/token";
import { useFailedSubjects, type FailedSubjectItem } from "@/hooks/useFailedSubjects";
import { useAddFailedSubjectAttempt } from "@/queries/useFailedSubjectMutations";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";

interface PendingSubjectsProps {
  tabsComponent?: React.ReactNode;
}

interface TableRow {
  n: number;
  cedula: string;
  estudiante: string;
  anio: string;
  materia1: FailedSubjectItem | null;
  materia2: FailedSubjectItem | null;
  materia1Attempts: (number | null)[];
  materia2Attempts: (number | null)[];
}

const LEVEL_NAMES: Record<number, string> = {
  1: "1er",
  2: "2do",
  3: "3er",
  4: "4to",
  5: "5to",
};

function getLevelOrder(level: string): number {
  const match = level.match(/(\d)/);
  return match ? parseInt(match[1]) : 99;
}

const MONTH_COLUMNS = ["Oct.", "Dic.", "Ene.", "Jun."] as const;
const MONTH_DATES = ["10", "12", "01", "06"] as const;

function parseName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.length >= 3 ? parts[2] : parts[1] ?? "";
  return `${firstName} ${lastName}`.trim();
}

function truncateSubject(name: string, maxLen = 12): string {
  if (name.length <= maxLen) return name.toUpperCase();
  return name.substring(0, maxLen).toUpperCase() + ".";
}

function getAttemptValue(failedSubject: FailedSubjectItem | null, attemptIndex: number): number | null {
  if (!failedSubject || !failedSubject.attempts[attemptIndex]) return null;
  return failedSubject.attempts[attemptIndex].score;
}

function isAttemptDisabled(
  failedSubject: FailedSubjectItem | null,
  attemptIndex: number,
  attempts: (number | null)[]
): { disabled: boolean; showAsterisk: boolean } {
  if (!failedSubject) return { disabled: true, showAsterisk: false };

  if (attemptIndex === 0) {
    const hasAny = attempts.some((v) => v !== null);
    return { disabled: hasAny, showAsterisk: false };
  }

  const prevScore = attempts[attemptIndex - 1];
  if (prevScore === null) {
    return { disabled: true, showAsterisk: false };
  }

  if (prevScore >= 10) {
    return { disabled: true, showAsterisk: true };
  }

  return { disabled: false, showAsterisk: false };
}

export default function PendingSubjects({ tabsComponent }: PendingSubjectsProps) {
  const [studentSearch, setStudentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [gradeMap, setGradeMap] = useState<Record<string, number | null>>({});

  const { data: failedSubjectsData, isLoading } = useFailedSubjects();
  const addAttempt = useAddFailedSubjectAttempt();
  const userData = useUserData();

  const levels = useMemo(() => failedSubjectsData?.data ?? [], [failedSubjectsData]);

  const currentYear = new Date().getFullYear();

  const allRows = useMemo(() => {
    const rows: TableRow[] = [];
    let counter = 1;
    for (const level of levels) {
      for (const student of level.students) {
        const sorted = [...student.failedSubjects].sort((a, b) => a.levelSubjectId - b.levelSubjectId);
        const materia1 = sorted[0] ?? null;
        const materia2 = sorted[1] ?? null;

        rows.push({
          n: counter++,
          cedula: student.identification,
          estudiante: parseName(student.studentName),
          anio: LEVEL_NAMES[getLevelOrder(level.level)] ?? level.level,
          materia1,
          materia2,
          materia1Attempts: MONTH_COLUMNS.map((_, i) => getAttemptValue(materia1, i)),
          materia2Attempts: MONTH_COLUMNS.map((_, i) => getAttemptValue(materia2, i)),
        });
      }
    }
    return rows;
  }, [levels]);

  const initialGradeMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const row of allRows) {
      if (row.materia1) {
        for (let i = 0; i < 4; i++) {
          map[`${row.materia1.id}-${i}`] = row.materia1Attempts[i];
        }
      }
      if (row.materia2) {
        for (let i = 0; i < 4; i++) {
          map[`${row.materia2.id}-${i}`] = row.materia2Attempts[i];
        }
      }
    }
    return map;
  }, [allRows]);

  const currentGradeMap = useMemo(() => {
    if (Object.keys(gradeMap).length === 0) return initialGradeMap;
    return { ...initialGradeMap, ...gradeMap };
  }, [gradeMap, initialGradeMap]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(currentGradeMap) !== JSON.stringify(initialGradeMap);
  }, [currentGradeMap, initialGradeMap]);

  const filteredRows = useMemo(() => {
    if (!studentSearch) return allRows;
    const q = studentSearch.toLowerCase();
    return allRows.filter(
      (r) => r.estudiante.toLowerCase().includes(q) || r.cedula.includes(q)
    );
  }, [allRows, studentSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const handleGradeChange = useCallback(
    (failedSubjectId: number, monthIndex: number, value: string) => {
      const cleaned = value.replace(/[^0-9]/g, "");
      const key = `${failedSubjectId}-${monthIndex}`;
      if (cleaned === "") {
        setGradeMap((prev) => ({ ...prev, [key]: null }));
        return;
      }
      const num = parseInt(cleaned, 10);
      const clamped = Math.min(20, Math.max(0, num));
      setGradeMap((prev) => ({ ...prev, [key]: clamped }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    for (const [, score] of Object.entries(currentGradeMap)) {
      if (score !== null && score > 20) {
        toast.custom(
          (t) => (
            <ToastMessage
              success={false}
              message={`La nota ${score} es mayor a 20. Ajuste antes de guardar.`}
              visible={t.visible}
            />
          ),
          { duration: 4000 }
        );
        return;
      }
    }

    try {
      for (const [key, score] of Object.entries(currentGradeMap)) {
        const initial = initialGradeMap[key];
        if (score !== null && score !== initial) {
          const [failedSubjectId, monthIndex] = key.split("-").map(Number);
          await addAttempt.mutateAsync({
            failedSubjectId,
            data: {
              score,
              evaluationDate: `${currentYear}-${MONTH_DATES[monthIndex]}`,
              createdBy: userData?.id ?? null,
            },
          });
        }
      }
      setGradeMap({});
      toast.custom(
        (t) => (
          <ToastMessage success={true} message="Notas guardadas correctamente" visible={t.visible} />
        ),
        { duration: 3000 }
      );
    } catch {
      // interceptor handles the toast
    }
  }, [currentGradeMap, initialGradeMap, addAttempt, currentYear, userData]);

  const buildColumns = useCallback((): Column<TableRow>[] => {
    const cols: Column<TableRow>[] = [
      {
        header: "N°",
        render: (row) => <span className="text-gray-600 text-xs">{row.n}</span>,
        className: "w-10",
        headerClassName: "w-10",
      },
      {
        header: "C.I.",
        render: (row) => <span className="text-gray-700 text-xs">{row.cedula}</span>,
        className: "whitespace-nowrap",
      },
      {
        header: "Estudiante",
        render: (row) => <span className="font-medium text-gray-800 text-sm">{row.estudiante}</span>,
      },
      {
        header: "Año",
        render: (row) => <span className="text-xs font-semibold text-gray-600">{row.anio}</span>,
        className: "text-center",
        headerClassName: "text-center",
      },
    ];

    const renderSubjectColumns = (label: string): Column<TableRow>[] => {
      const subjectCol: Column<TableRow> = {
        header: label,
        render: (row) => {
          const m = label === "Área Pend. 1" ? row.materia1 : row.materia2;
          return (
            <span className="text-xs font-bold text-amber-700 uppercase">
              {m ? truncateSubject(m.subjectName) : "*"}
            </span>
          );
        },
      };

      const gradeCols: Column<TableRow>[] = MONTH_COLUMNS.map((month, monthIdx) => ({
        header: month,
        render: (row) => {
          const m = label === "Área Pend. 1" ? row.materia1 : row.materia2;
          const a = label === "Área Pend. 1" ? row.materia1Attempts : row.materia2Attempts;

          if (!m) {
            return <span className="inline-flex items-center justify-center w-12 h-8 text-sm text-gray-300">—</span>;
          }

          const { disabled, showAsterisk } = isAttemptDisabled(m, monthIdx, a);

          const key = `${m.id}-${monthIdx}`;
          const currentVal = currentGradeMap[key] ?? null;

          if (showAsterisk) {
            return (
              <span className="inline-flex items-center justify-center w-12 h-8 text-sm text-gray-400">
                *
              </span>
            );
          }

          if (disabled) {
            if (currentVal != null) {
              const readOnlyClass = currentVal >= 10
                ? "inline-flex items-center justify-center w-12 h-8 px-1 text-center text-sm border border-green-300 bg-green-50 text-green-700 font-bold rounded"
                : "inline-flex items-center justify-center w-12 h-8 px-1 text-center text-sm border border-red-300 bg-red-50 text-red-700 font-bold rounded";
              return <span className={readOnlyClass}>{currentVal}</span>;
            }
            return (
              <span className="inline-flex items-center justify-center w-12 h-8 text-sm text-gray-400">
                *
              </span>
            );
          }

          const inputClass = currentVal != null
            ? currentVal >= 10
              ? "w-12 h-8 px-1 text-center text-sm border border-green-300 bg-green-50 text-green-700 font-bold rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              : "w-12 h-8 px-1 text-center text-sm border border-red-300 bg-red-50 text-red-700 font-bold rounded focus:outline-none focus:ring-1 focus:ring-red-500"
            : "w-12 h-8 px-1 text-center text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--blueColor)";

          return (
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={currentVal ?? ""}
              onKeyDown={(e) => {
                if (["-", "e", "E", ".", ",", "+"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => handleGradeChange(m.id, monthIdx, e.target.value)}
              disabled={addAttempt.isPending}
              className={inputClass}
            />
          );
        },
        className: "text-center px-1",
        headerClassName: "text-center px-1",
      }));

      return [subjectCol, ...gradeCols];
    };

    cols.push(...renderSubjectColumns("Área Pend. 1"));
    cols.push(...renderSubjectColumns("Área Pend. 2"));

    return cols;
  }, [currentGradeMap, handleGradeChange, addAttempt.isPending]);

  const columns = useMemo(() => buildColumns(), [buildColumns]);

  return (
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}

          {/* Header + Search + Save */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Materias Pendientes</h1>
                  <p className="text-sm text-gray-500">
                    {allRows.length} estudiante(s) con materias pendientes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SearchFilterComponent
                  searchTerm={studentSearch}
                  setSearchTerm={(term) => {
                    setStudentSearch(term);
                    setCurrentPage(1);
                  }}
                  placeHolder="Buscar por nombre o cédula..."
                  width="w-full"
                />
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={addAttempt.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-(--blueColor) text-white text-sm font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {addAttempt.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Guardar Notas
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando materias pendientes...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              No se encontraron estudiantes con materias pendientes.
            </div>
          ) : (
            <>
              <TableComponent data={paginatedRows} columns={columns} maxHeight={500} />
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRows.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(n) => {
                  setItemsPerPage(n);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </>
      }
    />
  );
}
