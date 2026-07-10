import { useState, useMemo, useRef, useCallback } from "react";
import { Loader2, ClipboardList, ArrowLeft, Users, UserPlus, Calendar } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useTeacherPlanning, useEvaluationsByTeachingGroup, useEvaluationTypes } from "@/hooks/useEvaluations";
import { useCreateEvaluation, useUpdateEvaluation, useDeleteEvaluation } from "@/queries/useEvaluationMutations";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { evaluationSchema, type EvaluationFormValues } from "@/services/evaluation/evaluation.schema";
import { evaluationColumns } from "@/services/evaluation/evaluation.tables";
import type { TeacherPlanningSection, EvaluationResponse } from "@/services/evaluation/evaluation.types";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  hasError?: boolean;
}

function AutocompleteInput({ value, onChange, suggestions, placeholder, hasError }: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    if (!value) return suggestions;
    const q = value.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(q));
  }, [value, suggestions]);

  const showCreateOption = value.trim() !== "" && !suggestions.some((s) => s.toLowerCase() === value.toLowerCase());

  const selectItem = (text: string) => {
    const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
    onChange(capitalized);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = showCreateOption ? [...filtered, value.trim()] : filtered;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectItem(items[highlightedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlightedIndex(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent text-sm",
          hasError ? "border-red-500" : "border-(--lightBlueColor)/30",
        )}
      />
      {open && (filtered.length > 0 || showCreateOption) && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {filtered.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => selectItem(s)}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-blue-50",
                highlightedIndex === i && "bg-blue-50",
              )}
            >
              {s}
            </li>
          ))}
          {showCreateOption && (
            <li
              onMouseDown={() => selectItem(value.trim())}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-green-50 text-green-700 font-medium border-t border-gray-100",
                highlightedIndex === filtered.length && "bg-green-50",
              )}
            >
              + Crear "{value.trim()}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function EvaluationPlan() {
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
    const data = periodsData as { periods?: { id: number; period: string; endDate?: string }[] } | undefined;
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
  const { mutateAsync: updateEvaluation } = useUpdateEvaluation();
  const { mutateAsync: deleteEvaluation } = useDeleteEvaluation();
  const [editingEvaluation, setEditingEvaluation] = useState<EvaluationResponse | null>(null);

  const evaluations = useMemo(() => {
    const response = evaluationsData as { data: EvaluationResponse[] } | undefined;
    return response?.data ?? (Array.isArray(evaluationsData) ? (evaluationsData as EvaluationResponse[]) : []);
  }, [evaluationsData]);

  const evalSummary = useMemo(() => {
    if (evaluations.length === 0) return null;
    const totalTopics = evaluations.length;
    const uniqueTypes = new Set(evaluations.map((e) => e.evaluationType.evaluationType)).size;
    const totalPercentage = evaluations.reduce((sum, e) => sum + Number(e.percentage), 0);
    const totalPuntos = (totalPercentage / 100) * 20;
    const currentPeriod = periods.find((p) => p.id === effectivePeriodId);
    const closingDate = currentPeriod?.endDate
      ? new Date(currentPeriod.endDate).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })
      : null;
    return { totalTopics, uniqueTypes, totalPercentage, totalPuntos, closingDate };
  }, [evaluations, periods, effectivePeriodId]);

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
      evaluationType: "",
      percentage: undefined as unknown as number,
      objectives: "",
    },
  });

  const watchedEvaluationType = useWatch({ control: form.control, name: "evaluationType" });
  const watchedPercentage = useWatch({ control: form.control, name: "percentage" });
  const puntos = useMemo(() => {
    const pct = Number(watchedPercentage) || 0;
    return Math.round((pct / 100) * 20 * 100) / 100;
  }, [watchedPercentage]);

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
      if (editingEvaluation) {
        await updateEvaluation({
          id: editingEvaluation.id,
          evaluationType: data.evaluationType,
          topic: data.topic,
          objectives: data.objectives || undefined,
          percentage: data.percentage,
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        });
      } else {
        await createEvaluation({
          teachingGroupId: selectedSection.teachingGroupId,
          periodId: effectivePeriodId,
          evaluationType: data.evaluationType,
          topic: data.topic,
          objectives: data.objectives || undefined,
          percentage: data.percentage,
          dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        });
      }
      setShowForm(false);
      setEditingEvaluation(null);
      form.reset();
    } catch {
      // interceptor handles the toast
    }
  };

  const handleEdit = useCallback((evaluation: EvaluationResponse) => {
    setEditingEvaluation(evaluation);
    form.setValue("topic", evaluation.topic);
    form.setValue("evaluationType", evaluation.evaluationType.evaluationType);
    form.setValue("percentage", evaluation.percentage as unknown as number);
    form.setValue("objectives", evaluation.objectives ?? "");
    if (evaluation.dueDate) {
      form.setValue("dueDate", new Date(evaluation.dueDate));
    }
    setShowForm(true);
  }, [form]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteEvaluation(id);
    } catch {
      // interceptor handles the toast
    }
  }, [deleteEvaluation]);

  const columns = useMemo(() => evaluationColumns({ onEdit: handleEdit, onDelete: handleDelete }), [handleEdit, handleDelete]);

  const summaryList = (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-linear-to-br from-purple-900 to-purple-800 rounded-xl">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Plan de Evaluación</h1>
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
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${section.isSpecialGroup
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
            onClick={() => { setShowForm(!showForm); setEditingEvaluation(null); form.reset(); }}
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
              {editingEvaluation ? "Editar Evaluación" : "Nueva Evaluación"}
            </h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRenderer field={{ name: "topic", label: "Tema", type: "text", placeholder: "Ej: Examen Parcial, Tarea #3..." }} />

                <div>
                  <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                    Tipo de Evaluación <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    value={watchedEvaluationType ?? ""}
                    onChange={(val) => form.setValue("evaluationType", val, { shouldValidate: true })}
                    suggestions={evaluationTypes.map((t) => t.evaluationType)}
                    placeholder="Escriba o seleccione un tipo..."
                    hasError={!!form.formState.errors.evaluationType}
                  />
                  {form.formState.errors.evaluationType && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.evaluationType.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Ponderación <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        step={1}
                        onInput={(e) => {
                          const input = e.currentTarget;
                          if (input.value.length > 2) {
                            input.value = input.value.slice(0, 2);
                          }
                        }}
                        {...form.register("percentage", { valueAsNumber: true })}
                        placeholder="20"
                        className={cn(
                          "w-full px-3 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                          form.formState.errors.percentage ? "border-red-500" : "border-(--lightBlueColor)/30",
                        )}
                      />
                      <span className="text-sm font-medium text-gray-500">%</span>
                    </div>
                    {form.formState.errors.percentage && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.percentage.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Puntos</label>
                    <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-gray-50">
                      <span className="text-sm font-semibold text-gray-700">{puntos}</span>
                      <span className="text-xs text-gray-400 ml-1">/ 20</span>
                    </div>
                  </div>

                  <FieldRenderer field={{ name: "dueDate", label: "Fecha", type: "date" }} />
                </div>

                <div className="md:col-span-2">
                  <FieldRenderer field={{ name: "objectives", label: "Objetivos (Opcional)", type: "textarea" }} />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-(--lightBlueColor)/20">
                <Button
                  type="button"
                  variant="outline"
                  className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
                  onClick={() => { setShowForm(false); setEditingEvaluation(null); form.reset(); }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer"
                >
                  {editingEvaluation ? "Guardar Cambios" : "Crear Evaluación"}
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
            <>
              <TableComponent data={evaluations} columns={columns} maxHeight={450} />
              {evalSummary && (
                <div className="mt-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Temas</p>
                      <p className="text-lg font-bold text-gray-800">{evalSummary.totalTopics}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Tipos</p>
                      <p className="text-lg font-bold text-gray-800">{evalSummary.uniqueTypes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Ponderación</p>
                      <p className="text-lg font-bold text-gray-800">{evalSummary.totalPercentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Puntos</p>
                      <p className="text-lg font-bold text-gray-800">{evalSummary.totalPuntos.toFixed(0)} / 20</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Cierre del Lapso</p>
                      <p className="text-lg font-bold text-gray-800">{evalSummary.closingDate ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
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
