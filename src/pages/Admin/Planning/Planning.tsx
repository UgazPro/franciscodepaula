import { useState, useMemo } from "react";
import { Loader2, ClipboardList, ArrowLeft, Users, UserPlus, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useTeacherPlanning, useEvaluationsByTeachingGroup, useEvaluationTypes } from "@/hooks/useEvaluations";
import { useCreateEvaluation } from "@/queries/useEvaluationMutations";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { evaluationSchema, type EvaluationFormValues } from "@/services/evaluation/evaluation.schema";
import { evaluationColumns } from "@/services/evaluation/evaluation.tables";
import type { TeacherPlanningSection, EvaluationResponse } from "@/services/evaluation/evaluation.types";
import type { FormField } from "@/components/form/formComponent.interface";

export default function Planning() {
  const [screen, setScreen] = useState<"list" | "detail">("list");
  const [selectedSection, setSelectedSection] = useState<TeacherPlanningSection | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const { data: planningData, isLoading } = useTeacherPlanning();
  const { data: periodsData } = useActiveSchoolYear();
  const { data: evaluationTypesData } = useEvaluationTypes();

  const sections = useMemo(() => {
    const response = planningData as { data: TeacherPlanningSection[] } | undefined;
    return response?.data ?? (Array.isArray(planningData) ? (planningData as TeacherPlanningSection[]) : []);
  }, [planningData]);

  const periods = useMemo(() => {
    const data = periodsData as { periods?: { id: number; period: string; isActive?: boolean }[] } | undefined;
    return data?.periods ?? [];
  }, [periodsData]);

  const evaluationTypes = useMemo(() => {
    const response = evaluationTypesData as { data: { id: number; evaluationType: string }[] } | undefined;
    return response?.data ?? (Array.isArray(evaluationTypesData) ? (evaluationTypesData as { id: number; evaluationType: string }[]) : []);
  }, [evaluationTypesData]);

  const effectivePeriodId = useMemo(() => {
    if (selectedPeriodId) return selectedPeriodId;
    if (periods.length > 0) return periods[0].id;
    return null;
  }, [selectedPeriodId, periods]);

  const { data: evaluationsData, isLoading: isLoadingEvaluations } = useEvaluationsByTeachingGroup(
    selectedSection?.teachingGroupId ?? null,
    effectivePeriodId,
  );
  const { mutateAsync: createEvaluation } = useCreateEvaluation();

  const evaluations = useMemo(() => {
    const response = evaluationsData as { data: EvaluationResponse[] } | undefined;
    return response?.data ?? (Array.isArray(evaluationsData) ? (evaluationsData as EvaluationResponse[]) : []);
  }, [evaluationsData]);

  const subjects = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of sections) {
      if (!map.has(s.subjectId)) {
        map.set(s.subjectId, s.subject);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sections]);

  const filteredSections = useMemo(() => {
    let result = sections;
    if (selectedSubjectFilter) {
      result = result.filter((s) => s.subjectId === selectedSubjectFilter);
    }
    return result;
  }, [sections, selectedSubjectFilter]);

  const totalCardPages = Math.max(1, Math.ceil(filteredSections.length / itemsPerPage));

  const paginatedSections = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSections.slice(start, start + itemsPerPage);
  }, [filteredSections, currentPage, itemsPerPage]);

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      topic: "",
      evaluationTypeId: 0,
      percentage: 0,
      maxScore: 20,
      objectives: "",
    },
  });

  const evalTypeField: FormField = useMemo(() => ({
    name: "evaluationTypeId",
    label: "Tipo de Evaluación",
    type: "select",
    placeholder: "Seleccione un tipo",
    options: evaluationTypes.map((t) => ({
      label: t.evaluationType,
      value: t.id,
    })),
  }), [evaluationTypes]);

  const handleSelectSection = (section: TeacherPlanningSection) => {
    setSelectedSection(section);
    setShowForm(false);
    setScreen("detail");
  };

  const handleBack = () => {
    setScreen("list");
    setSelectedSection(null);
    setShowForm(false);
    form.reset();
  };

  const handleSave = async (data: EvaluationFormValues) => {
    if (!selectedSection || !effectivePeriodId) return;
    try {
      await createEvaluation({
        teachingGroupId: selectedSection.teachingGroupId,
        periodId: effectivePeriodId,
        evaluationTypeId: data.evaluationTypeId,
        topic: data.topic,
        objectives: data.objectives || undefined,
        percentage: data.percentage,
        maxScore: data.maxScore,
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      });
      setShowForm(false);
      form.reset();
    } catch {
      // interceptor handles the toast
    }
  };

  const columns = useMemo(() => evaluationColumns(), []);

  const summaryList = (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-linear-to-br from-purple-900 to-purple-800 rounded-xl">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Planificación</h1>
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
          Cargando planificación...
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
                    section.isSpecialGroup
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {section.isSpecialGroup ? 'extra' : 'regular'}
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
          >
            <Calendar size={18} />
            {showForm ? "Ver Evaluaciones" : "Crear Evaluación"}
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-(--lightBlueColor)/20">
            <h2 className="text-lg font-semibold text-(--darkBlueColor)">
              Nueva Evaluación
            </h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRenderer field={{ name: "topic", label: "Tema", type: "text", placeholder: "Ej: Examen Parcial, Tarea #3..." }} />
                <FieldRenderer field={evalTypeField} />
                <FieldRenderer field={{ name: "percentage", label: "Ponderación (%)", type: "text", inputType: "number", placeholder: "Ej: 20" }} />
                <FieldRenderer field={{ name: "maxScore", label: "Nota Máxima", type: "text", inputType: "number", placeholder: "Ej: 20" }} />
                <FieldRenderer field={{ name: "objectives", label: "Objetivos (Opcional)", type: "textarea" }} />
                <FieldRenderer field={{ name: "dueDate", label: "Fecha de Evaluación (Opcional)", type: "date" }} />
              </div>

              <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-(--lightBlueColor)/20">
                <Button
                  type="button"
                  variant="outline"
                  className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
                  onClick={() => { setShowForm(false); form.reset(); }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer"
                >
                  Crear Evaluación
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <div>
          {isLoadingEvaluations ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando evaluaciones...
            </div>
          ) : evaluations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              No hay evaluaciones registradas para este lapso. Haz clic en "Crear Evaluación" para agregar una.
            </div>
          ) : (
            <TableComponent data={evaluations} columns={columns} maxHeight={450} />
          )}
        </div>
      )}
    </div>
  );

  const toggle = screen === "detail";

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <PageTransitionComponent
        primaryChildren={summaryList}
        secondaryChildren={detailView}
        toggle={toggle}
      />
    </div>
  );
}
