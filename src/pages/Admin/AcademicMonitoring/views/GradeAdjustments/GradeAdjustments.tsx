import { useState, useMemo, useCallback } from "react";
import { Loader2, Table2, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { ToastMessage } from "@/components/toast/ToastMessage";
import { useUserData } from "@/helpers/token";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useSabanaData, type SabanaSection, type SabanaStudentSubject } from "@/hooks/useGradeAdjustments";
import { useSaveGradeAdjustments } from "@/queries/useGradeAdjustmentMutations";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";

interface GradeAdjustmentsProps {
  tabsComponent?: React.ReactNode;
}

interface TableRow {
  n: number;
  estudiante: string;
  studentId: number;
  subjects: SabanaStudentSubject[];
}

export default function GradeAdjustments({ tabsComponent }: GradeAdjustmentsProps) {
  const [selectedSection, setSelectedSection] = useState<SabanaSection | null>(null);
  const [adjustmentMap, setAdjustmentMap] = useState<Record<string, number | null>>({});
  const [studentSearch, setStudentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  const { data: periodsData } = useActiveSchoolYear();
  const saveAdjustments = useSaveGradeAdjustments();
  const userData = useUserData();

  const periods = useMemo(() => {
    const data = periodsData as { periods?: { id: number; period: string }[] } | undefined;
    return data?.periods ?? [];
  }, [periodsData]);

  const effectivePeriodId = useMemo(() => {
    if (selectedPeriodId) return selectedPeriodId;
    return periods[0]?.id ?? null;
  }, [selectedPeriodId, periods]);

  const { data: sabanaData, isLoading } = useSabanaData(effectivePeriodId);

  const sections = useMemo(() => sabanaData?.data?.sections ?? [], [sabanaData]);

  const currentAdjustmentMap = useMemo(() => {
    if (!selectedSection) return {};
    const map: Record<string, number | null> = {};
    for (const student of selectedSection.students) {
      for (const subj of student.subjects) {
        const key = `${student.studentId}-${subj.levelSubjectId}`;
        map[key] = subj.currentAdjustment;
      }
    }
    return { ...map, ...adjustmentMap };
  }, [selectedSection, adjustmentMap]);

  const hasChanges = useMemo(() => {
    if (!selectedSection) return false;
    for (const student of selectedSection.students) {
      for (const subj of student.subjects) {
        if (subj.periodGrade !== null) {
          const key = `${student.studentId}-${subj.levelSubjectId}`;
          const currentVal = currentAdjustmentMap[key];
          if (currentVal !== subj.currentAdjustment) return true;
        }
      }
    }
    return false;
  }, [selectedSection, currentAdjustmentMap]);

  const handleSave = useCallback(async () => {
    if (!selectedSection || !userData?.id || !effectivePeriodId) return;

    const changes: Array<{
      studentId: number;
      teachingGroupId: number;
      periodId: number;
      adjustment: number;
      createdBy: number;
    }> = [];

    for (const student of selectedSection.students) {
      for (const subj of student.subjects) {
        if (subj.periodGrade !== null) {
          const key = `${student.studentId}-${subj.levelSubjectId}`;
          const newVal = currentAdjustmentMap[key];
          if (newVal != null && newVal !== subj.currentAdjustment) {
            changes.push({
              studentId: student.studentId,
              teachingGroupId: subj.teachingGroupId,
              periodId: effectivePeriodId,
              adjustment: newVal,
              createdBy: userData.id,
            });
          }
        }
      }
    }

    if (changes.length === 0) return;

    try {
      await saveAdjustments.mutateAsync({ adjustments: changes });
      setAdjustmentMap({});
      toast.custom(
        (t) => (
          <ToastMessage
            success={true}
            message={`${changes.length} ajuste(s) guardado(s)`}
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
            message="Error al guardar los ajustes"
            visible={t.visible}
          />
        ),
        { duration: 3000 }
      );
    }
  }, [selectedSection, userData, effectivePeriodId, currentAdjustmentMap, saveAdjustments]);

  const buildColumns = useCallback((): Column<TableRow>[] => {
    if (!selectedSection) return [];

    const baseCols: Column<TableRow>[] = [
      {
        header: "N°",
        accessor: "n",
        className: "w-12 text-center",
        headerClassName: "text-center",
      },
      {
        header: "Estudiante",
        accessor: "estudiante",
      },
    ];

    const subjectCols: Column<TableRow>[] = selectedSection.subjects.map((subj) => ({
      header: subj.subjectCode,
      render: (row: TableRow) => {
        const sg = row.subjects.find((s) => s.levelSubjectId === subj.levelSubjectId);
        if (!sg || sg.periodGrade === null) {
          return <span className="inline-flex items-center justify-center w-14 h-8 text-sm text-gray-300">—</span>;
        }

        const key = `${row.studentId}-${subj.levelSubjectId}`;
        const currentVal = currentAdjustmentMap[key] ?? null;
        const isFailed = sg.periodGrade < 10;

        const gradeClass = isFailed
          ? "text-sm font-semibold text-red-600 w-8 text-right"
          : "text-sm text-gray-600 w-8 text-right";

        return (
          <div className="flex items-center gap-1">
            <span className={gradeClass}>{sg.periodGrade}</span>
            <select
              value={currentVal ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? null : Number(e.target.value);
                setAdjustmentMap((prev) => ({ ...prev, [key]: val }));
              }}
              disabled={saveAdjustments.isPending}
              className="w-12 h-6 px-0.5 text-center text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--blueColor) cursor-pointer"
            >
              <option value=""></option>
              <option value="1">+1</option>
              <option value="2">+2</option>
            </select>
          </div>
        );
      },
      className: "text-center px-1",
      headerClassName: "text-center px-1",
    }));

    const promedioCol: Column<TableRow> = {
      header: "Promedio",
      render: (row: TableRow) => {
        const nonSpecial = row.subjects.filter((s) => {
          const subj = selectedSection.subjects.find((sub) => sub.levelSubjectId === s.levelSubjectId);
          return subj && !subj.isSpecialGroup && s.periodGrade !== null;
        });
        if (nonSpecial.length === 0) return <span className="text-sm text-gray-400">—</span>;
        const avg = Math.round(nonSpecial.reduce((sum, s) => sum + (s.periodGrade ?? 0), 0) / nonSpecial.length);
        const colorClass = avg < 10 ? "text-red-600 font-semibold" : "text-gray-800 font-semibold";
        return <span className={`text-sm ${colorClass}`}>{avg}</span>;
      },
      className: "text-center",
      headerClassName: "text-center font-semibold",
    };

    return [...baseCols, ...subjectCols, promedioCol];
  }, [selectedSection, currentAdjustmentMap, saveAdjustments.isPending]);

  const tableRows = useMemo((): TableRow[] => {
    if (!selectedSection) return [];
    let filtered = selectedSection.students;
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      filtered = filtered.filter(
        (s) => s.studentName.toLowerCase().includes(q)
      );
    }
    return filtered.map((s, i) => ({
      n: i + 1,
      estudiante: s.studentName,
      studentId: s.studentId,
      subjects: s.subjects,
    }));
  }, [selectedSection, studentSearch]);

  const totalPages = Math.max(1, Math.ceil(tableRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tableRows.slice(start, start + itemsPerPage);
  }, [tableRows, currentPage, itemsPerPage]);

  const columns = useMemo(() => buildColumns(), [buildColumns]);

  const handleBack = useCallback(() => {
    setSelectedSection(null);
    setAdjustmentMap({});
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
                <Table2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Sabana</h2>
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
                    <option key={p.id} value={p.id}>{p.period}</option>
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
                    onClick={hasStudents ? () => { setSelectedSection(section); setAdjustmentMap({}); setStudentSearch(""); setCurrentPage(1); } : undefined}
                    className={`flex flex-col gap-3 bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left ${
                      hasStudents
                        ? "hover:shadow-md hover:border-(--blueColor) cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100">
                        <span className="text-lg font-bold text-indigo-600">
                          {section.level.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{section.label}</h3>
                        <p className="text-sm text-gray-500">
                          {hasStudents
                            ? `${section.studentCount} estudiante(s)`
                            : "Sin estudiantes"
                          }
                        </p>
                      </div>
                    </div>
                    {hasStudents && (
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                        <span>M {section.maleCount} / F {section.femaleCount}</span>
                        <span>
                          Prom:{" "}
                          <span className={`font-semibold ${section.sectionAverage != null && section.sectionAverage < 10 ? "text-red-600" : "text-gray-700"}`}>
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
        selectedSection && (
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
                    <Table2 size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">{selectedSection.label}</h1>
                    <p className="text-sm text-gray-500">
                      {selectedSection.studentCount} estudiante(s) — {selectedSection.subjects.length} materia(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SearchFilterComponent
                    searchTerm={studentSearch}
                    setSearchTerm={(term) => { setStudentSearch(term); setCurrentPage(1); }}
                    placeHolder="Buscar alumno por nombre..."
                    width="w-full"
                  />
                  {hasChanges && (
                    <button
                      onClick={handleSave}
                      disabled={saveAdjustments.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-(--blueColor) text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    >
                      {saveAdjustments.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar Ajustes
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
      toggle={!!selectedSection}
    />
  );
}
