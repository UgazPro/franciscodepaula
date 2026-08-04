import { useState, useMemo, useCallback } from "react";
import { Loader2, BookOpen, ArrowLeft, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import {
  useGradesReviewSections,
  type GradesReviewSection,
  type GradesReviewSubject,
} from "@/hooks/useGradesReview";
import { useGradeDetail } from "@/hooks/useGrades";
import { useSaveGrades } from "@/queries/useGradeMutations";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import { TooltipComponent } from "@/components/tooltip/TooltipComponent";

interface StudentGradesReviewProps {
  tabsComponent?: React.ReactNode;
}

interface SubjectTableRow {
  n: number;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  periodGrade: number | null;
  teachingGroupId: number;
  isSpecialGroup: boolean;
  totalEvaluations: number;
  gradedEvaluations: number;
}

interface GradeTableRow {
  n: number;
  id: number;
  firstNames: string;
  lastNames: string;
  identificationNumber: string;
  grades: Record<number, number | null>;
  hasApprovedSubject: boolean;
  approvedSubjectScore: number | null;
  hasMissingGrades: boolean;
  definitiva: number;
}

export default function StudentGradesReview({
  tabsComponent,
}: StudentGradesReviewProps) {
  const [selectedSection, setSelectedSection] =
    useState<GradesReviewSection | null>(null);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] =
    useState<GradesReviewSubject | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [gradeMap, setGradeMap] = useState<Record<number, Record<number, number | null>>>({});
  const [editingCells, setEditingCells] = useState<Set<string>>(new Set());

  const { data: periodsData } = useActiveSchoolYear();
  const { data: sectionsData, isLoading } = useGradesReviewSections(
    selectedPeriodId,
  );
  const { mutateAsync: saveGrades, isPending: isSaving } = useSaveGrades();

  const periods = useMemo(() => {
    const data = periodsData as
      | {
          periods?: {
            id: number;
            period: string;
            startDate?: string;
            endDate?: string;
          }[];
        }
      | undefined;
    return data?.periods ?? [];
  }, [periodsData]);

  const defaultPeriodId = useMemo(() => {
    if (periods.length === 0) return null;
    const today = new Date();
    const active = periods.find((p) => {
      if (!p.startDate || !p.endDate) return false;
      return new Date(p.startDate) <= today && today <= new Date(p.endDate);
    });
    return active?.id ?? null;
  }, [periods]);

  const effectivePeriodId = selectedPeriodId ?? defaultPeriodId;

  const sections = useMemo(
    () => sectionsData?.data?.sections ?? [],
    [sectionsData],
  );

  const { data: detailData, isLoading: isLoadingDetail } = useGradeDetail(
    selectedSubject?.teachingGroupId ?? null,
    effectivePeriodId,
  );

  const detail = detailData as {
    data?: {
      students: {
        id: number;
        person: { firstNames: string; lastNames: string; identificationNumber: string };
        hasApprovedSubject?: boolean;
        approvedSubjectScore?: number | null;
      }[];
      evaluations: {
        id: number;
        topic: string;
        percentage: number;
        evaluationType: { evaluationType: string };
      }[];
      grades: { studentId: number; evaluationId: number; score: number | null }[];
    };
  } | undefined;

  const students = useMemo(() => detail?.data?.students ?? [], [detail]);
  const evaluations = useMemo(() => detail?.data?.evaluations ?? [], [detail]);
  const existingGrades = useMemo(() => detail?.data?.grades ?? [], [detail]);

  const initialGradeMap = useMemo(() => {
    const map: Record<number, Record<number, number | null>> = {};
    for (const s of students) {
      map[s.id] = {};
      for (const ev of evaluations) {
        const found = existingGrades.find(
          (g) => g.studentId === s.id && g.evaluationId === ev.id,
        );
        map[s.id][ev.id] = found?.score ?? null;
      }
    }
    return map;
  }, [students, evaluations, existingGrades]);

  const currentGradeMap = Object.keys(gradeMap).length > 0 ? gradeMap : initialGradeMap;

  const handleGradeChange = useCallback(
    (studentId: number, evaluationId: number, value: string) => {
      const cleaned = value.replace(/[^0-9]/g, "");
      if (cleaned === "") {
        setGradeMap((prev) => {
          const newMap = { ...prev };
          if (!newMap[studentId]) newMap[studentId] = { ...initialGradeMap[studentId] };
          else newMap[studentId] = { ...newMap[studentId] };
          newMap[studentId][evaluationId] = null;
          return newMap;
        });
        return;
      }
      const num = parseInt(cleaned, 10);
      const clamped = Math.min(20, Math.max(1, num));
      setGradeMap((prev) => {
        const newMap = { ...prev };
        if (!newMap[studentId]) newMap[studentId] = { ...initialGradeMap[studentId] };
        else newMap[studentId] = { ...newMap[studentId] };
        newMap[studentId][evaluationId] = clamped;
        return newMap;
      });
    },
    [initialGradeMap],
  );

  const toggleEditCell = useCallback((studentId: number, evaluationId: number) => {
    const key = `${studentId}-${evaluationId}`;
    setEditingCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const exitEditCell = useCallback((studentId: number, evaluationId: number) => {
    const key = `${studentId}-${evaluationId}`;
    setEditingCells((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(currentGradeMap) !== JSON.stringify(initialGradeMap);
  }, [currentGradeMap, initialGradeMap]);

  const handleSave = async () => {
    const gradesToSave: { studentId: number; evaluationId: number; score: number }[] = [];
    for (const studentIdStr of Object.keys(currentGradeMap)) {
      const studentId = Number(studentIdStr);
      for (const evaluationIdStr of Object.keys(currentGradeMap[studentId])) {
        const evaluationId = Number(evaluationIdStr);
        const score = currentGradeMap[studentId][evaluationId];
        if (score !== null && score !== undefined) {
          gradesToSave.push({ studentId, evaluationId, score });
        }
      }
    }
    if (gradesToSave.length === 0) return;
    await saveGrades({ grades: gradesToSave });
    setGradeMap({});
    setEditingCells(new Set());
  };

  const handleSectionClick = useCallback((section: GradesReviewSection) => {
    setSelectedSection(section);
    setSubjectModalOpen(true);
  }, []);

  const handleSubjectClick = useCallback((subject: GradesReviewSubject) => {
    setSelectedSubject(subject);
    setSubjectModalOpen(false);
    setGradeMap({});
    setEditingCells(new Set());
    setStudentSearch("");
    setCurrentPage(1);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSubject(null);
    setStudentSearch("");
    setCurrentPage(1);
    setGradeMap({});
    setEditingCells(new Set());
  }, []);

  const filteredStudents = useMemo(() => {
    if (!selectedSubject) return [];
    const filtered = students.filter((s) => {
      if (!studentSearch) return true;
      const fullName = `${s.person.firstNames} ${s.person.lastNames}`.toLowerCase();
      return fullName.includes(studentSearch.toLowerCase());
    });
    return filtered;
  }, [students, studentSearch, selectedSubject]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const buildSubjectColumns = useCallback((): Column<SubjectTableRow>[] => [
    {
      header: "N°",
      accessor: "n",
      className: "w-12 text-center",
      headerClassName: "text-center",
    },
    {
      header: "Materia",
      accessor: "subjectName",
      className: "font-medium text-gray-800",
    },
    {
      header: "Código",
      accessor: "subjectCode",
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      header: "Profesor(a)",
      accessor: "teacherName",
    },
    {
      header: "Evals",
      render: (row: SubjectTableRow) => (
        <span className="text-sm text-gray-600">
          {row.gradedEvaluations}/{row.totalEvaluations}
        </span>
      ),
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      header: "Promedio",
      render: (row: SubjectTableRow) => {
        const colorClass =
          row.periodGrade != null && row.periodGrade < 10
            ? "text-red-600 font-semibold"
            : "text-gray-800 font-semibold";
        return (
          <span className={`text-sm ${colorClass}`}>
            {row.periodGrade != null ? row.periodGrade : "—"}
          </span>
        );
      },
      className: "text-center",
      headerClassName: "text-center",
    },
  ], []);

  const subjectTableRows = useMemo((): SubjectTableRow[] => {
    if (!selectedSection) return [];
    return selectedSection.subjects.map((subj, i) => ({
      n: i + 1,
      subjectName: subj.subjectName,
      subjectCode: subj.subjectCode,
      teacherName: subj.teacherName,
      periodGrade: subj.periodGrade,
      teachingGroupId: subj.teachingGroupId,
      isSpecialGroup: subj.isSpecialGroup,
      totalEvaluations: subj.totalEvaluations,
      gradedEvaluations: subj.gradedEvaluations,
    }));
  }, [selectedSection]);

  const gradeColumns = useMemo((): Column<GradeTableRow>[] => {
    const baseCols: Column<GradeTableRow>[] = [
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

    const evalCols: Column<GradeTableRow>[] = evaluations.map((ev, idx) => ({
      header: `EVA ${idx + 1} (${ev.percentage}%)`,
      render: (row) => {
        if (row.hasApprovedSubject) {
          return (
            <span className="text-amber-500 font-bold text-sm">*</span>
          );
        }
        const cellKey = `${row.id}-${ev.id}`;
        const isEditing = editingCells.has(cellKey);
        const currentVal = row.grades[ev.id];

        if (isEditing) {
          return (
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              autoFocus
              value={currentVal ?? ""}
              onKeyDown={(e) => {
                if (["-", "e", "E", ".", ",", "+"].includes(e.key)) e.preventDefault();
                if (e.key === "Enter") exitEditCell(row.id, ev.id);
                if (e.key === "Escape") exitEditCell(row.id, ev.id);
              }}
              onChange={(e) => handleGradeChange(row.id, ev.id, e.target.value)}
              onBlur={() => exitEditCell(row.id, ev.id)}
              className="w-12 h-8 px-1 text-center text-sm border border-(--blueColor) rounded focus:outline-none focus:ring-1 focus:ring-(--blueColor) bg-white"
              placeholder="—"
            />
          );
        }

        return (
          <div className="flex items-center justify-center gap-1">
            <span className={`text-sm ${currentVal != null ? (currentVal < 10 ? "text-red-600 font-semibold" : "text-gray-800") : "text-gray-400"}`}>
              {currentVal != null ? currentVal : "—"}
            </span>
            <button
              onClick={() => toggleEditCell(row.id, ev.id)}
              className="p-0.5 rounded hover:bg-gray-100 transition cursor-pointer"
            >
              <Pencil size={12} className="text-gray-400 hover:text-(--blueColor)" />
            </button>
          </div>
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

    const definitivaCol: Column<GradeTableRow> = {
      header: "Definitiva",
      render: (row) => {
        if (row.hasApprovedSubject) {
          const score = row.approvedSubjectScore;
          return (
            <span className={`text-sm font-bold ${score != null && score >= 10 ? "text-green-600" : "text-gray-800"}`}>
              {score != null ? score.toFixed(1) : "—"}
            </span>
          );
        }
        return (
          <span className={`text-sm font-bold ${row.hasMissingGrades ? "text-gray-400" : row.definitiva >= 10 ? "text-green-600" : "text-gray-800"}`}>
            {row.hasMissingGrades ? "—" : row.definitiva > 0 ? row.definitiva.toFixed(1) : "—"}
          </span>
        );
      },
      headerClassName: "text-center",
      className: "text-center",
    };

    return [...baseCols, ...evalCols, definitivaCol];
  }, [evaluations, editingCells, handleGradeChange, toggleEditCell, exitEditCell]);

  const gradeTableRows = useMemo((): GradeTableRow[] => {
    return paginatedStudents.map((s, i) => {
      const studentGrades = currentGradeMap[s.id] ?? {};
      const hasApproved = s.hasApprovedSubject ?? false;
      let totalWeighted = 0;
      let totalPercentage = 0;
      let hasMissingGrades = false;
      if (!hasApproved) {
        for (const ev of evaluations) {
          const score = studentGrades[ev.id];
          if (score !== null && score !== undefined) {
            totalWeighted += (score / 20) * ev.percentage;
            totalPercentage += ev.percentage;
          } else {
            hasMissingGrades = true;
          }
        }
      }
      const definitiva = totalPercentage > 0 ? (totalWeighted / totalPercentage) * 20 : 0;
      return {
        n: (currentPage - 1) * itemsPerPage + i + 1,
        id: s.id,
        firstNames: s.person.firstNames,
        lastNames: s.person.lastNames,
        identificationNumber: s.person.identificationNumber,
        grades: studentGrades,
        hasApprovedSubject: hasApproved,
        approvedSubjectScore: s.approvedSubjectScore ?? null,
        hasMissingGrades,
        definitiva,
      };
    });
  }, [paginatedStudents, evaluations, currentGradeMap, currentPage, itemsPerPage]);

  const subjectColumns = useMemo(
    () => buildSubjectColumns(),
    [buildSubjectColumns],
  );

  return (
    <>
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}

          {/* Header */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Notas Estudiantiles
                </h2>
                <p className="text-sm text-gray-500">
                  {sections.length} sección(es) disponible(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {periods.length > 0 && (
                <select
                  value={effectivePeriodId ?? ""}
                  onChange={(e) => {
                    setSelectedPeriodId(Number(e.target.value) || null);
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--blueColor)"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.period}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Section Cards */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando secciones...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sections.map((section) => {
                const hasStudents = section.studentCount > 0;
                return (
                  <div
                    key={section.sectionId}
                    onClick={
                      hasStudents
                        ? () => handleSectionClick(section)
                        : undefined
                    }
                    className={`flex flex-col gap-3 bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left ${
                      hasStudents
                        ? "hover:shadow-md hover:border-(--blueColor) cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100">
                        <span className="text-lg font-bold text-purple-600">
                          {section.level.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {section.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {hasStudents
                            ? `${section.studentCount} estudiante(s)`
                            : "Sin estudiantes"}
                        </p>
                      </div>
                    </div>
                    {hasStudents && (
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                        <span>{section.subjects.length} materia(s)</span>
                        <span>
                          Prom:{" "}
                          <span
                            className={`font-semibold ${section.sectionAverage != null && section.sectionAverage < 10 ? "text-red-600" : "text-gray-700"}`}
                          >
                            {section.sectionAverage ?? "—"}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      }
      secondaryChildren={
        selectedSubject && (
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
                  <div className="p-3 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl">
                    <BookOpen size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">
                      {selectedSubject.subjectName}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {selectedSubject.teacherName} — {selectedSection?.label ?? ""}
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
                    placeHolder="Buscar alumno por nombre..."
                    width="w-full"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            {isLoadingDetail ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Cargando estudiantes y evaluaciones...
              </div>
            ) : evaluations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
                No hay evaluaciones creadas para este grupo en el período seleccionado.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <TableComponent
                    data={gradeTableRows}
                    columns={gradeColumns}
                    maxHeight={500}
                  />
                </div>

                {totalPages > 1 && (
                  <div className="mt-4">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )
      }
      toggle={!!selectedSubject}
    />

    {/* Subject Selection Modal */}
    <Dialog open={subjectModalOpen} onOpenChange={setSubjectModalOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800">
            {selectedSection?.label} — Materias
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Promedio de sección:{" "}
            <span
              className={`font-semibold ${selectedSection?.sectionAverage != null && selectedSection.sectionAverage < 10 ? "text-red-600" : "text-gray-700"}`}
            >
              {selectedSection?.sectionAverage ?? "—"}
            </span>
          </p>
        </DialogHeader>

        <div className="mt-4">
          <TableComponent
            data={subjectTableRows}
            columns={subjectColumns}
            maxHeight={400}
            onRowClick={(row) => {
              const subj = selectedSection?.subjects.find(
                (s) => s.teachingGroupId === row.teachingGroupId,
              );
              if (subj) handleSubjectClick(subj);
            }}
            rowClassName={() =>
              "cursor-pointer hover:bg-purple-50 transition"
            }
          />
        </div>
      </DialogContent>
    </Dialog>

    {/* Period Selection Modal (when no period matches today) */}
    <Dialog
      open={periods.length > 0 && effectivePeriodId === null}
      onOpenChange={() => {}}
    >
      <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800">
            Seleccionar Lapso
          </DialogTitle>
          <p className="text-sm text-gray-500">
            No se encontró un lapso activo para la fecha actual. Seleccione uno para continuar.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriodId(p.id)}
              className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition cursor-pointer"
            >
              <span className="font-medium text-gray-800">{p.period}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}
