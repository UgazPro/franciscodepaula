import { useState, useMemo, useCallback } from "react";
import { Loader2, AlertTriangle, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { ToastMessage } from "@/components/toast/ToastMessage";
import { useUserData } from "@/helpers/token";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useReviewStudents, type ReviewLevel, type ReviewSubjectGrade } from "@/hooks/useReviewStudents";
import { useSaveReviewGrade } from "@/queries/useReviewMutations";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";

interface ReviewProps {
  tabsComponent?: React.ReactNode;
}

interface TableRow {
  n: number;
  cedula: string;
  estudiante: string;
  sec: string;
  sectionId: number;
  studentId: number;
  subjectGrades: ReviewSubjectGrade[];
}

export default function Review({ tabsComponent }: ReviewProps) {
  const [selectedLevel, setSelectedLevel] = useState<ReviewLevel | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [gradeMap, setGradeMap] = useState<Record<string, number | null>>({});

  const { data: reviewData, isLoading } = useReviewStudents();
  const saveReview = useSaveReviewGrade();
  const userData = useUserData();
  const { data: activeSchoolYear } = useActiveSchoolYear();

  const levels = useMemo(() => reviewData?.data ?? [], [reviewData]);

  const handleGradeChange = useCallback(
    (studentId: number, levelSubjectId: number, value: string) => {
      const cleaned = value.replace(/[^0-9]/g, "");
      const key = `${studentId}-${levelSubjectId}`;
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

  const currentGradeMap = useMemo(() => {
    if (!selectedLevel) return {};
    const map: Record<string, number | null> = {};
    for (const student of selectedLevel.students) {
      for (const sg of student.subjectGrades) {
        const key = `${student.studentId}-${sg.levelSubjectId}`;
        map[key] = sg.reviewScore;
      }
    }
    return { ...map, ...gradeMap };
  }, [selectedLevel, gradeMap]);

  const hasChanges = useMemo(() => {
    if (!selectedLevel) return false;
    for (const student of selectedLevel.students) {
      for (const sg of student.subjectGrades) {
        if (!sg.passed) {
          const key = `${student.studentId}-${sg.levelSubjectId}`;
          const currentVal = currentGradeMap[key];
          if (currentVal !== sg.reviewScore) return true;
        }
      }
    }
    return false;
  }, [selectedLevel, currentGradeMap]);

  const handleSave = useCallback(async () => {
    if (!selectedLevel || !userData?.id || !activeSchoolYear?.id) return;

    const schoolId = 1;

    const changes: Array<{
      studentId: number;
      levelSubjectId: number;
      sectionId: number;
      schoolId: number;
      schoolYearId: number;
      finalScore: number;
    }> = [];

    for (const student of selectedLevel.students) {
      for (const sg of student.subjectGrades) {
        if (!sg.passed) {
          const key = `${student.studentId}-${sg.levelSubjectId}`;
          const newVal = currentGradeMap[key];
          if (newVal != null && newVal !== sg.reviewScore) {
            changes.push({
              studentId: student.studentId,
              levelSubjectId: sg.levelSubjectId,
              sectionId: student.sectionId,
              schoolId,
              schoolYearId: activeSchoolYear.id,
              finalScore: newVal,
            });
          }
        }
      }
    }

    if (changes.length === 0) return;

    try {
      for (const change of changes) {
        await saveReview.mutateAsync(change);
      }
      setGradeMap({});
      toast.custom(
        (t) => (
          <ToastMessage
            success={true}
            message={`${changes.length} nota(s) de revisión guardada(s)`}
            visible={t.visible}
          />
        ),
        { duration: 3000 }
      );
    } catch {
      toast.custom(
        (t) => (
          <ToastMessage
            success={false}
            message="Error al guardar las notas de revisión"
            visible={t.visible}
          />
        ),
        { duration: 3000 }
      );
    }
  }, [selectedLevel, userData, activeSchoolYear, currentGradeMap, saveReview]);

  const buildColumns = useCallback((): Column<TableRow>[] => {
    if (!selectedLevel) return [];

    const baseCols: Column<TableRow>[] = [
      {
        header: "N°",
        accessor: "n",
        className: "w-12 text-center",
        headerClassName: "text-center",
      },
      {
        header: "C.I.",
        accessor: "cedula",
      },
      {
        header: "Estudiante",
        accessor: "estudiante",
      },
      {
        header: "Sec",
        accessor: "sec",
        className: "text-center",
        headerClassName: "text-center",
      },
    ];

    const subjectCols: Column<TableRow>[] = selectedLevel.subjects.map((subj) => ({
      header: subj.subjectCode,
      render: (row: TableRow) => {
        const sg = row.subjectGrades.find((s) => s.levelSubjectId === subj.levelSubjectId);
        if (!sg) {
          return <span className="inline-flex items-center justify-center w-14 h-8 text-sm text-gray-300">—</span>;
        }

        if (sg.passed) {
          return (
            <span className="inline-flex items-center justify-center w-14 h-8 text-sm text-gray-400">
              *
            </span>
          );
        }

        const key = `${row.studentId}-${sg.levelSubjectId}`;
        const currentVal = currentGradeMap[key] ?? null;

        const inputClass = currentVal != null
          ? currentVal >= 10
            ? "w-14 h-8 px-1 text-center text-sm border border-green-300 bg-green-50 text-green-700 font-bold rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            : "w-14 h-8 px-1 text-center text-sm border border-red-300 bg-red-50 text-red-700 font-bold rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          : "w-14 h-8 px-1 text-center text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--blueColor)";

        return (
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={currentVal ?? ""}
            onKeyDown={(e) => {
              if (["-", "e", "E", ".", ",", "+"].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => handleGradeChange(row.studentId, sg.levelSubjectId, e.target.value)}
            disabled={saveReview.isPending}
            className={inputClass}
          />
        );
      },
      className: "text-center px-1",
      headerClassName: "text-center px-1",
    }));

    return [...baseCols, ...subjectCols];
  }, [selectedLevel, currentGradeMap, handleGradeChange, saveReview.isPending]);

  const tableRows = useMemo((): TableRow[] => {
    if (!selectedLevel) return [];
    let filtered = selectedLevel.students;
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      filtered = filtered.filter(
        (s) => s.studentName.toLowerCase().includes(q) || s.identification.includes(q)
      );
    }
    return filtered.map((s, i) => ({
      n: i + 1,
      cedula: s.identification,
      estudiante: s.studentName,
      sec: s.section,
      sectionId: s.sectionId,
      studentId: s.studentId,
      subjectGrades: s.subjectGrades,
    }));
  }, [selectedLevel, studentSearch]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tableRows.slice(start, start + itemsPerPage);
  }, [tableRows, currentPage, itemsPerPage]);

  const columns = useMemo(() => buildColumns(), [buildColumns]);

  const handleBack = useCallback(() => {
    setSelectedLevel(null);
    setGradeMap({});
    setStudentSearch("");
    setCurrentPage(1);
  }, []);

  return (
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}

          {/* Header */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100">
                <AlertTriangle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Revisión</h2>
                <p className="text-sm text-gray-500">
                  {levels.length} año(s) disponible(s)
                </p>
              </div>
            </div>
          </div>

          {/* Level Cards */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando años...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {levels.map((level) => {
                const hasStudents = level.studentCount > 0;
                return (
                  <div
                    key={level.highSchoolLevelId}
                    onClick={hasStudents ? () => { setSelectedLevel(level); setGradeMap({}); setStudentSearch(""); setCurrentPage(1); } : undefined}
                    className={`flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left ${
                      hasStudents
                        ? "hover:shadow-md hover:border-(--blueColor) cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100">
                      <span className="text-lg font-bold text-indigo-600">
                        {level.level.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{level.level}</h3>
                      <p className="text-sm text-gray-500">
                        {hasStudents
                          ? `${level.studentCount} estudiante(s) — ${level.subjects.length} materia(s)`
                          : "No hay alumnos a revisión"
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      }
      secondaryChildren={
        selectedLevel && (
          <div>
            {/* Detail Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  >
                    <ArrowLeft size={20} className="text-(--blueColor)" />
                  </button>
                  <div className="p-3 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl">
                    <AlertTriangle size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">{selectedLevel.level}</h1>
                    <p className="text-sm text-gray-500">
                      {selectedLevel.studentCount} estudiante(s) — {selectedLevel.subjects.length} materia(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SearchFilterComponent
                    searchTerm={studentSearch}
                    setSearchTerm={(term) => { setStudentSearch(term); setCurrentPage(1); }}
                    placeHolder="Buscar alumno por nombre o cédula..."
                    width="w-full"
                  />
                  {hasChanges && (
                    <button
                      onClick={handleSave}
                      disabled={saveReview.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-(--blueColor) text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    >
                      {saveReview.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar Notas
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <TableComponent
              data={paginatedRows}
              columns={columns}
              maxHeight={500}
            />

            {totalPages > 1 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )
      }
      toggle={!!selectedLevel}
    />
  );
}
