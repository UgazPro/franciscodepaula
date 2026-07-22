import { useState, useMemo } from "react";
import { Loader2, ClipboardList, ArrowLeft, LayoutGrid, LayoutList } from "lucide-react";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import { useTeachersOverview } from "@/hooks/useGrades";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { teacherOverviewColumns, teacherGroupColumns } from "@/services/grade/grade.tables";
import type { TeacherOverview } from "@/services/grade/grade.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UploadGradesManagementProps {
  tabsComponent?: React.ReactNode;
}

export default function UploadGradesManagement({ tabsComponent }: UploadGradesManagementProps) {
  const [screen, setScreen] = useState<"list" | "detail">("list");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOverview | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const { data: periodsData } = useActiveSchoolYear();
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  const periods = useMemo(() => {
    const data = periodsData as { periods?: { id: number; period: string }[] } | undefined;
    return data?.periods ?? [];
  }, [periodsData]);

  const effectivePeriodId = useMemo(() => {
    if (selectedPeriodId) return selectedPeriodId;
    if (periods.length > 0) return periods[0].id;
    return null;
  }, [selectedPeriodId, periods]);

  const { data: overviewData, isLoading } = useTeachersOverview(effectivePeriodId);

  const teachers = useMemo(() => {
    const response = overviewData as { data?: TeacherOverview[] } | undefined;
    return response?.data ?? (Array.isArray(overviewData) ? (overviewData as TeacherOverview[]) : []);
  }, [overviewData]);

  const filteredTeachers = useMemo(() => {
    if (!searchTerm) return teachers;
    const q = searchTerm.toLowerCase();
    return teachers.filter((t) =>
      t.teacherName.toLowerCase().includes(q) ||
      t.identificationNumber.includes(q)
    );
  }, [teachers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / itemsPerPage));
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(start, start + itemsPerPage);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  const handleSelectTeacher = (teacher: TeacherOverview) => {
    setSelectedTeacher(teacher);
    setScreen("detail");
  };

  const handleBack = () => {
    setScreen("list");
    setSelectedTeacher(null);
  };

  const groupColumns = useMemo(() => teacherGroupColumns(), []);
  const teacherTableColumns = useMemo(() => teacherOverviewColumns(), []);

  const toggle = screen === "detail";

  return (
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 bg-linear-to-br from-purple-900 to-purple-800 rounded-xl">
                  <ClipboardList size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Carga de Notas</h1>
                  <p className="text-sm text-gray-500">
                    {teachers.length} profesor(es) registrado(s)
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:ml-auto items-end sm:items-center">
                <SearchFilterComponent
                  searchTerm={searchTerm}
                  setSearchTerm={(term) => { setSearchTerm(term); setCurrentPage(1); }}
                  placeHolder="Buscar profesor..."
                  width="w-48"
                />
                <div className="w-full sm:w-40">
                  <select
                    value={effectivePeriodId ?? ""}
                    onChange={(e) => {
                      setSelectedPeriodId(Number(e.target.value) || null);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--blueColor)"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>{p.period}</option>
                    ))}
                  </select>
                </div>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2.5 transition cursor-pointer ${viewMode === "card"
                      ? "bg-(--blueColor) text-white"
                      : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2.5 transition cursor-pointer ${viewMode === "table"
                      ? "bg-(--blueColor) text-white"
                      : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando profesores...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              No hay profesores registrados en este lapso.
            </div>
          ) : viewMode === "card" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedTeachers.map((teacher) => (
                  <div
                    key={teacher.teacherId}
                    onClick={() => handleSelectTeacher(teacher)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {teacher.teacherName.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 group-hover:text-(--blueColor) transition truncate">
                          {teacher.teacherName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {teacher.identificationNumber}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {teacher.groups.length} materia(s)
                      </span>
                      {(() => {
                        const pct = teacher.totalCount > 0 ? Math.round((teacher.loadedCount / teacher.totalCount) * 100) : 0;
                        const unloaded = teacher.groups.filter((g) => !g.isLoaded).map((g) => g.subject);
                        const label = (
                          <span className={`text-sm font-medium cursor-help ${teacher.loadedCount === teacher.totalCount ? "text-green-600" : "text-gray-600"}`}>
                            {teacher.loadedCount}/{teacher.totalCount} cargada(s) ({pct}%)
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
                      })()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredTeachers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                />
              </div>
            </>
          ) : (
            <div>
              <TableComponent
                data={paginatedTeachers}
                columns={teacherTableColumns}
                onRowClick={(row) => handleSelectTeacher(row)}
                maxHeight={400}
              />
              <div>
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredTeachers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                />
              </div>
            </div>
          )}
        </>
      }
      secondaryChildren={
        selectedTeacher && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  <ArrowLeft size={20} className="text-(--blueColor)" />
                </button>
                <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {selectedTeacher.teacherName.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{selectedTeacher.teacherName}</h1>
                  {(() => {
                    const pct = selectedTeacher.totalCount > 0 ? Math.round((selectedTeacher.loadedCount / selectedTeacher.totalCount) * 100) : 0;
                    const unloaded = selectedTeacher.groups.filter((g) => !g.isLoaded).map((g) => g.subject);
                    const label = (
                      <p className="text-sm text-gray-500 cursor-help inline">
                        {selectedTeacher.loadedCount}/{selectedTeacher.totalCount} materia(s) cargada(s) ({pct}%)
                      </p>
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
                  })()}
                </div>
                <div className="md:ml-auto">
                  <select
                    value={effectivePeriodId ?? ""}
                    onChange={(e) => setSelectedPeriodId(Number(e.target.value) || null)}
                    className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--blueColor)"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>{p.period}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedTeacher.groups.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
                No hay materias asignadas para este profesor en el lapso seleccionado.
              </div>
            ) : (
              <TableComponent
                data={selectedTeacher.groups}
                columns={groupColumns}
                maxHeight={500}
              />
            )}
          </div>
        )
      }
      toggle={toggle}
    />
  );
}
