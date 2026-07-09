import { useState, useMemo, useCallback } from "react";
import { Loader2, ClipboardList, ArrowLeft, Users, UserPlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useGradeTeacherPlanning, useGradeDetail } from "@/hooks/useGrades";
import { useSaveGrades } from "@/queries/useGradeMutations";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { gradeColumns } from "@/services/grade/grade.tables";
import type { GradePlanningSection, GradeStudentRow, GradeEvaluation } from "@/services/grade/grade.types";

export default function Grades() {
  const [screen, setScreen] = useState<"list" | "detail">("list");
  const [selectedSection, setSelectedSection] = useState<GradePlanningSection | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [gradeMap, setGradeMap] = useState<Record<number, Record<number, number | null>>>({});

  const { data: planningData, isLoading } = useGradeTeacherPlanning();
  const { data: periodsData } = useActiveSchoolYear();
  const { mutateAsync: saveGrades, isPending: isSaving } = useSaveGrades();

  const sections = useMemo(() => {
    const response = planningData as { data: GradePlanningSection[] } | undefined;
    return response?.data ?? (Array.isArray(planningData) ? (planningData as GradePlanningSection[]) : []);
  }, [planningData]);

  const periods = useMemo(() => {
    const data = periodsData as { periods?: { id: number; period: string }[] } | undefined;
    return data?.periods ?? [];
  }, [periodsData]);

  const effectivePeriodId = useMemo(() => {
    if (selectedPeriodId) return selectedPeriodId;
    if (periods.length > 0) return periods[0].id;
    return null;
  }, [selectedPeriodId, periods]);

  const { data: detailData, isLoading: isLoadingDetail } = useGradeDetail(
    selectedSection?.teachingGroupId ?? null,
    effectivePeriodId,
  );

  const subjects = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of sections) {
      if (!map.has(s.subjectId)) map.set(s.subjectId, s.subject);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sections]);

  const filteredSections = useMemo(() => {
    let result = sections;
    if (selectedSubjectFilter) result = result.filter(s => s.subjectId === selectedSubjectFilter);
    return result;
  }, [sections, selectedSubjectFilter]);

  const totalCardPages = Math.max(1, Math.ceil(filteredSections.length / itemsPerPage));

  const paginatedSections = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSections.slice(start, start + itemsPerPage);
  }, [filteredSections, currentPage, itemsPerPage]);

  const detail = detailData as { data?: { students: { id: number; person: { firstNames: string; lastNames: string; identificationNumber: string } }[]; evaluations: GradeEvaluation[]; grades: { studentId: number; evaluationId: number; score: number | null }[] } } | undefined;

  const students = useMemo(() => detail?.data?.students ?? [], [detail]);
  const evaluations = useMemo(() => detail?.data?.evaluations ?? [], [detail]);
  const existingGrades = useMemo(() => detail?.data?.grades ?? [], [detail]);

  const initialGradeMap = useMemo(() => {
    const map: Record<number, Record<number, number | null>> = {};
    for (const s of students) {
      map[s.id] = {};
      for (const ev of evaluations) {
        const found = existingGrades.find(g => g.studentId === s.id && g.evaluationId === ev.id);
        map[s.id][ev.id] = found?.score ?? null;
      }
    }
    return map;
  }, [students, evaluations, existingGrades]);

  const currentGradeMap = Object.keys(gradeMap).length > 0 ? gradeMap : initialGradeMap;

  const tableData: GradeStudentRow[] = useMemo(() => {
    return students.map((s) => {
      const studentGrades = currentGradeMap[s.id] ?? {};
      let totalWeighted = 0;
      let totalPercentage = 0;
      let hasMissingGrades = false;
      for (const ev of evaluations) {
        const score = studentGrades[ev.id];
        if (score !== null && score !== undefined) {
          totalWeighted += (score / 20) * ev.percentage;
          totalPercentage += ev.percentage;
        } else {
          hasMissingGrades = true;
        }
      }
      const definitiva = totalPercentage > 0 ? (totalWeighted / totalPercentage) * 20 : 0;
      return {
        id: s.id,
        firstNames: s.person.firstNames,
        lastNames: s.person.lastNames,
        identificationNumber: s.person.identificationNumber,
        grades: studentGrades,
        definitiva,
        hasMissingGrades,
      };
    });
  }, [students, evaluations, currentGradeMap]);

  const handleGradeChange = useCallback((studentId: number, evaluationId: number, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setGradeMap(prev => {
      const newMap = { ...prev };
      if (!newMap[studentId]) newMap[studentId] = { ...initialGradeMap[studentId] };
      else newMap[studentId] = { ...newMap[studentId] };
      newMap[studentId][evaluationId] = isNaN(numValue as number) ? null : numValue;
      return newMap;
    });
  }, [initialGradeMap]);

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
  };

  const handleSelectSection = (section: GradePlanningSection) => {
    setSelectedSection(section);
    setGradeMap({});
    setScreen("detail");
  };

  const handleBack = () => {
    setScreen("list");
    setSelectedSection(null);
    setGradeMap({});
  };

  const columns = useMemo(() => gradeColumns(evaluations, handleGradeChange), [evaluations, handleGradeChange]);

  const summaryList = (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-linear-to-br from-purple-900 to-purple-800 rounded-xl">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Notas</h1>
              <p className="text-sm text-gray-500">
                {sections.length} sección(es) asignada(s)
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:ml-auto">
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lapso</label>
              <select
                value={selectedPeriodId ?? ""}
                onChange={(e) => { setSelectedPeriodId(Number(e.target.value) || null); setCurrentPage(1); }}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--blueColor)"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>{p.period}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
              <select
                value={selectedSubjectFilter ?? ""}
                onChange={(e) => { setSelectedSubjectFilter(Number(e.target.value) || null); setCurrentPage(1); }}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--blueColor)"
              >
                <option value="">Todas las materias</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando notas...
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No hay secciones asignadas{selectedSubjectFilter ? " para esta materia" : ""}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedSections.map((section) => (
              <div
                key={section.teachingGroupId}
                onClick={() => handleSelectSection(section)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 group-hover:text-(--blueColor) transition text-lg">
                    {section.groupName ? `CRP (${section.groupName})` : section.subject}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    section.isSpecialGroup ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {section.isSpecialGroup ? "extra" : "regular"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {section.groupName
                    ? section.sections
                    : section.isSpecialGroup && section.sectionId === null
                      ? section.sections
                      : `${section.level} — Sección ${section.section}`}
                </p>
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 mt-3">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Users size={16} className="text-purple-600" />
                    <span className="text-sm font-medium">{section.totalStudents}</span>
                    <span className="text-xs text-gray-400">total</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <UserPlus size={14} className="text-blue-500" />
                    <span className="text-sm">{section.maleStudents}♂</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <UserPlus size={14} className="text-pink-500" />
                    <span className="text-sm">{section.femaleStudents}♀</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {section.evaluationCount} evaluacion(es)
                  </span>
                  <span className={`text-xs font-medium ${section.loadedPercentage > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {section.loadedPercentage.toFixed(0)}% cargado
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalCardPages}
              totalItems={filteredSections.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        </>
      )}
    </div>
  );

  const detailView = selectedSection && (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft size={20} className="text-(--blueColor)" />
            </button>
            <div className="p-3 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {selectedSection.groupName ? `CRP (${selectedSection.groupName})` : selectedSection.subject}
              </h1>
              <p className="text-sm text-gray-500">
                {selectedSection.groupName
                  ? selectedSection.sections
                  : selectedSection.isSpecialGroup && selectedSection.sectionId === null
                    ? selectedSection.sections
                    : `${selectedSection.level} — Sección ${selectedSection.section}`}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Notas
          </Button>
        </div>
      </div>

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <TableComponent
            data={tableData}
            columns={columns}
            maxHeight={500}
          />
        </div>
      )}
    </div>
  );

  return (
    <PageTransitionComponent
      primaryChildren={summaryList}
      secondaryChildren={detailView}
      toggle={screen === "detail"}
    />
  );
}
