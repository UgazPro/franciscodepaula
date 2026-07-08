import { useState, useMemo, useCallback } from "react";
import { Loader2, UserPlus, LayoutGrid, LayoutList, Users, ArrowLeft, CircleX } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useSpecialGroups, useSpecialGroupStudents, useAvailableStudentsForCRP } from "@/hooks/useSpecialGroups";
import {
  useAddStudentsToSpecialGroup,
  useRemoveStudentFromSpecialGroup,
} from "@/queries/useSpecialGroupMutations";
import { crpStudentColumns, crpAvailableStudentColumns } from "@/services/teacher-assignment/teacher-assignment.tables";
import type { Column } from "@/components/table/TableComponent";
import type { SpecialGroupResponse, CRPStudentResponse, AvailableStudentResponse } from "@/services/teacher-assignment/teacher-assignment.types";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import DialogComponent from "@/components/dialog/DialogComponent";

interface CRPViewProps {
  tabsComponent?: React.ReactNode;
}

export default function CRPView({ tabsComponent }: CRPViewProps) {
  const [screen, setScreen] = useState<"list" | "students" | "assign">("list");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const [selectedCRP, setSelectedCRP] = useState<string | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([]);
  const [studentToRemove, setStudentToRemove] = useState<{ id: number; name: string } | null>(null);
  const [enrolledSearch, setEnrolledSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [showAllCRPs, setShowAllCRPs] = useState(false);
  const [searchAllCRPs, setSearchAllCRPs] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Assign screen state
  const [assignSelectedStudents, setAssignSelectedStudents] = useState<number[]>([]);
  const [assignSelectedCRP, setAssignSelectedCRP] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCRPSearch, setAssignCRPSearch] = useState("");

  const { data: groupsData, isLoading } = useSpecialGroups();
  const { data: studentsData, isLoading: isLoadingStudents } = useSpecialGroupStudents(selectedCRP);
  const { data: availableStudentsData, isLoading: isLoadingAvailable } = useAvailableStudentsForCRP();

  const { mutateAsync: addStudents } = useAddStudentsToSpecialGroup();
  const { mutateAsync: removeStudent } = useRemoveStudentFromSpecialGroup();

  const groups = useMemo(() => {
    const response = groupsData as { data: SpecialGroupResponse[] } | undefined;
    const data = response?.data ?? (Array.isArray(groupsData) ? (groupsData as SpecialGroupResponse[]) : []);
    return data.filter((g) => g.status !== null);
  }, [groupsData]);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => statusFilter === "active" ? g.status === true : g.status === false);
  }, [groups, statusFilter]);

  const searchedGroups = useMemo(() => {
    if (!searchAllCRPs) return filteredGroups;
    const q = searchAllCRPs.toLowerCase();
    return filteredGroups.filter((g) => g.groupName.toLowerCase().includes(q));
  }, [filteredGroups, searchAllCRPs]);

  const students = useMemo(() => {
    const response = studentsData as { data: CRPStudentResponse[] };
    return response?.data ?? (Array.isArray(studentsData) ? (studentsData as CRPStudentResponse[]) : []);
  }, [studentsData]);

  const availableStudents = useMemo(() => {
    const response = availableStudentsData as { data: AvailableStudentResponse[] };
    return response?.data ?? (Array.isArray(availableStudentsData) ? (availableStudentsData as AvailableStudentResponse[]) : []);
  }, [availableStudentsData]);

  const filteredStudents = useMemo(() => {
    if (!enrolledSearch) return students;
    const q = enrolledSearch.toLowerCase();
    return students.filter((s: CRPStudentResponse) =>
      `${s.studentEnrollment.student.person.firstNames} ${s.studentEnrollment.student.person.lastNames}`.toLowerCase().includes(q) ||
      s.studentEnrollment.student.person.identificationNumber.includes(q)
    );
  }, [students, enrolledSearch]);

  const filteredAvailableStudents = useMemo(() => {
    if (!availableSearch) return availableStudents;
    const q = availableSearch.toLowerCase();
    return availableStudents.filter((s: AvailableStudentResponse) =>
      `${s.student.person.firstNames} ${s.student.person.lastNames}`.toLowerCase().includes(q) ||
      s.student.person.identificationNumber.includes(q)
    );
  }, [availableStudents, availableSearch]);

  // Assign screen: filter available students for left panel
  const filteredAssignStudents = useMemo(() => {
    if (!assignSearch) return availableStudents;
    const q = assignSearch.toLowerCase();
    return availableStudents.filter((s: AvailableStudentResponse) =>
      `${s.student.person.firstNames} ${s.student.person.lastNames}`.toLowerCase().includes(q) ||
      s.student.person.identificationNumber.includes(q)
    );
  }, [availableStudents, assignSearch]);

  // Assign screen: filter CRPs for right panel
  const filteredAssignGroups = useMemo(() => {
    const activeGroups = groups.filter((g) => g.status === true);
    if (!assignCRPSearch) return activeGroups;
    const q = assignCRPSearch.toLowerCase();
    return activeGroups.filter((g) =>
      g.groupName.toLowerCase().includes(q) ||
      `${g.employee.user.person.firstNames} ${g.employee.user.person.lastNames}`.toLowerCase().includes(q)
    );
  }, [groups, assignCRPSearch]);

  const totalPages = Math.max(1, Math.ceil(searchedGroups.length / itemsPerPage));
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return searchedGroups.slice(start, start + itemsPerPage);
  }, [searchedGroups, currentPage, itemsPerPage]);

  const handleSelectCRP = (groupName: string) => {
    setSelectedCRP(groupName);
    setSelectedEnrollments([]);
    setScreen("students");
  };

  const handleBackFromStudents = () => {
    setSelectedCRP(null);
    setSelectedEnrollments([]);
    setScreen("list");
  };

  const handleToggleEnrollment = useCallback((enrollmentId: number) => {
    setSelectedEnrollments((prev) =>
      prev.includes(enrollmentId)
        ? prev.filter((id) => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  }, []);

  const handleAssignStudents = async () => {
    if (!selectedCRP || selectedEnrollments.length === 0) return;
    try {
      await addStudents({ groupName: selectedCRP, studentEnrollmentIds: selectedEnrollments });
      setSelectedEnrollments([]);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleRemoveStudent = useCallback(async (studentEnrollmentId: number, studentName: string) => {
    setStudentToRemove({ id: studentEnrollmentId, name: studentName });
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    if (!studentToRemove || !selectedCRP) return;
    try {
      await removeStudent({ groupName: selectedCRP, studentEnrollmentId: studentToRemove.id });
      setStudentToRemove(null);
    } catch {
      setStudentToRemove(null);
    }
  }, [studentToRemove, selectedCRP, removeStudent]);

  // Assign screen handlers
  const handleToggleAssignStudent = useCallback((enrollmentId: number) => {
    setAssignSelectedStudents((prev) =>
      prev.includes(enrollmentId)
        ? prev.filter((id) => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  }, []);

  const handleSelectAssignCRP = useCallback((groupName: string) => {
    setAssignSelectedCRP((prev) => prev === groupName ? null : groupName);
  }, []);

  const handleConfirmAssign = async () => {
    if (!assignSelectedCRP || assignSelectedStudents.length === 0) return;
    try {
      await addStudents({ groupName: assignSelectedCRP, studentEnrollmentIds: assignSelectedStudents });
      setAssignSelectedStudents([]);
      setAssignSelectedCRP(null);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleBackFromAssign = () => {
    setScreen("list");
    setAssignSelectedStudents([]);
    setAssignSelectedCRP(null);
    setAssignSearch("");
    setAssignCRPSearch("");
  };

  const handleSearchCRP = useCallback((term: string) => {
    setSearchAllCRPs(term);
    setCurrentPage(1);
  }, []);

  const studentColumns = useMemo(() => crpStudentColumns(handleRemoveStudent), [handleRemoveStudent]);
  const availableStudentColumns = useMemo(() => crpAvailableStudentColumns(selectedEnrollments, handleToggleEnrollment), [selectedEnrollments, handleToggleEnrollment]);

  // Assign screen: available students columns with multi-select
  const assignStudentColumns = useMemo(() => crpAvailableStudentColumns(assignSelectedStudents, handleToggleAssignStudent), [assignSelectedStudents, handleToggleAssignStudent]);

  const groupTableColumns = useMemo((): Column<SpecialGroupResponse>[] => [
    {
      header: "CRP",
      render: (row) => <span className="font-medium text-gray-800">{row.groupName}</span>,
    },
    {
      header: "Profesor",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
            {row.employee.user.person.firstNames.charAt(0)}
            {row.employee.user.person.lastNames.charAt(0)}
          </div>
          <span className="text-sm text-gray-700">
            {row.employee.user.person.firstNames} {row.employee.user.person.lastNames}
          </span>
        </div>
      ),
    },
    {
      header: "Estado",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {row.status ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Estudiantes",
      render: (row) => <span className="text-gray-600">{row.totalStudents ?? 0}</span>,
    },
  ], []);

  const toggle = screen !== "list";

  return (
    <>
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-linear-to-br from-purple-900 to-purple-800 rounded-xl">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Grupos CRP</h1>
                  <p className="text-sm text-gray-500">
                    {searchedGroups.length} CRP(s) registrado(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => { setStatusFilter("inactive"); setCurrentPage(1); }}
                    className={`px-3 py-2.5 text-xs font-medium transition cursor-pointer ${
                      statusFilter === "inactive"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Inactivos
                  </button>
                  <button
                    onClick={() => { setStatusFilter("active"); setCurrentPage(1); }}
                    className={`px-3 py-2.5 text-xs font-medium transition cursor-pointer ${
                      statusFilter === "active"
                        ? "bg-green-500 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Activos
                  </button>
                </div>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
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
                <div className="flex items-center gap-2">
                  <SearchFilterComponent
                    searchTerm={searchAllCRPs}
                    setSearchTerm={handleSearchCRP}
                    placeHolder="Buscar CRP..."
                    width="w-48"
                  />
                  <button
                    onClick={() => setShowAllCRPs(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition shadow-md cursor-pointer text-sm font-medium whitespace-nowrap"
                  >
                    Ver CRPs
                  </button>
                </div>
                <button
                  onClick={() => setScreen("assign")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
                >
                  <UserPlus size={18} />
                  Asignar Alumno
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando grupos CRP...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              {statusFilter === "active"
                ? "No hay grupos CRP activos."
                : "No hay grupos CRP inactivos."
              }
            </div>
          ) : viewMode === "card" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => handleSelectCRP(group.groupName)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {group.groupName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-(--blueColor) transition">
                            {group.groupName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {group.employee.user.person.firstNames} {group.employee.user.person.lastNames}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${group.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {group.status ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-400">
                        {group.totalStudents ?? 0} estudiante(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredGroups.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                />
              </div>
            </>
          ) : (
            <div>
              <TableComponent
                data={paginatedGroups}
                columns={groupTableColumns}
                onRowClick={(row) => handleSelectCRP(row.groupName)}
                maxHeight={450}
              />
              <div className="mt-4">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredGroups.length}
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
        screen === "students" && selectedCRP ? (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackFromStudents}
                  className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  <ArrowLeft size={20} className="text-(--blueColor)" />
                </button>
                <div className="p-3 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{selectedCRP}</h1>
                  <p className="text-sm text-gray-500">
                    {students.length} estudiante(s) inscrito(s)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Enrolled students */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={18} className="text-purple-600" />
                  <h2 className="font-semibold text-gray-800">Inscritos</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{students.length}</span>
                </div>
                <div className="mb-2">
                  <SearchFilterComponent
                    searchTerm={enrolledSearch}
                    setSearchTerm={setEnrolledSearch}
                    placeHolder="Buscar por nombre o cédula..."
                    width="w-full"
                  />
                </div>
                {isLoadingStudents ? (
                  <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Cargando...
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No hay estudiantes inscritos.
                  </div>
                ) : (
                  <TableComponent data={filteredStudents} columns={studentColumns} maxHeight={350} />
                )}

                <AlertDialog open={!!studentToRemove} onOpenChange={(open) => { if (!open) setStudentToRemove(null); }}>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md p-0 overflow-hidden">
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
                        <CircleX size={28} className="text-red-600" />
                      </div>
                      <AlertDialogHeader className="items-center text-center">
                        <AlertDialogTitle className="w-full text-center text-xl font-bold text-gray-800 mb-2">
                          ¿Desinscribir estudiante?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 text-center">
                          ¿Estás seguro de que deseas desinscribir a{" "}
                          <strong>{studentToRemove?.name}</strong> de este CRP?
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex gap-3 mt-6">
                        <AlertDialogCancel className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleConfirmRemove}
                          className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                        >
                          Desinscribir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Available students */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-green-600" />
                    <h2 className="font-semibold text-gray-800">Disponibles</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{availableStudents.length}</span>
                  </div>
                  {selectedEnrollments.length > 0 && (
                    <button
                      onClick={handleAssignStudents}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer"
                    >
                      <UserPlus size={14} />
                      Asignar ({selectedEnrollments.length})
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <SearchFilterComponent
                    searchTerm={availableSearch}
                    setSearchTerm={setAvailableSearch}
                    placeHolder="Buscar por nombre o cédula..."
                    width="w-full"
                  />
                </div>
                {isLoadingAvailable ? (
                  <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Cargando...
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No hay estudiantes disponibles.
                  </div>
                ) : (
                  <TableComponent data={filteredAvailableStudents} columns={availableStudentColumns} maxHeight={350} />
                )}
              </div>
            </div>
          </div>
        ) : screen === "assign" ? (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackFromAssign}
                  className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  <ArrowLeft size={20} className="text-(--blueColor)" />
                </button>
                <div className="p-3 bg-linear-to-br from-green-500 to-green-600 rounded-xl">
                  <UserPlus size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Asignar Alumno a CRP</h1>
                  <p className="text-sm text-gray-500">
                    Seleccione los estudiantes y el CRP destino
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available students (multi-select) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-green-600" />
                    <h2 className="font-semibold text-gray-800">Estudiantes Disponibles</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{availableStudents.length}</span>
                  </div>
                  {assignSelectedStudents.length > 0 && (
                    <span className="text-xs font-medium text-(--blueColor) bg-blue-50 px-2 py-1 rounded-full">
                      {assignSelectedStudents.length} seleccionado(s)
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <SearchFilterComponent
                    searchTerm={assignSearch}
                    setSearchTerm={setAssignSearch}
                    placeHolder="Buscar por nombre o cédula..."
                    width="w-full"
                  />
                </div>
                {isLoadingAvailable ? (
                  <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Cargando...
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No hay estudiantes disponibles para asignar.
                  </div>
                ) : (
                  <TableComponent data={filteredAssignStudents} columns={assignStudentColumns} maxHeight={350} />
                )}
              </div>

              {/* CRP selection (single-select) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-purple-600" />
                    <h2 className="font-semibold text-gray-800">Seleccionar CRP</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredAssignGroups.length}</span>
                  </div>
                  {assignSelectedStudents.length > 0 && assignSelectedCRP && (
                    <button
                      onClick={handleConfirmAssign}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer"
                    >
                      <UserPlus size={14} />
                      Asignar {assignSelectedStudents.length} a {assignSelectedCRP}
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <SearchFilterComponent
                    searchTerm={assignCRPSearch}
                    setSearchTerm={setAssignCRPSearch}
                    placeHolder="Buscar CRP..."
                    width="w-full"
                  />
                </div>
                {filteredAssignGroups.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No hay grupos CRP activos disponibles.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {filteredAssignGroups.map((group) => (
                      <div
                        key={group.id}
                        onClick={() => handleSelectAssignCRP(group.groupName)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition cursor-pointer ${
                          assignSelectedCRP === group.groupName
                            ? "border-(--blueColor) bg-blue-50"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {group.groupName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{group.groupName}</p>
                          <p className="text-xs text-gray-500">
                            {group.employee.user.person.firstNames} {group.employee.user.person.lastNames}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-gray-400">{group.totalStudents ?? 0} alumnos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null
      }
      toggle={toggle}
    />

    <DialogComponent
      openDialog={showAllCRPs}
      onClose={setShowAllCRPs}
      dialogTitle="Todos los CRPs"
      dialogDescription={`${filteredGroups.length} CRP(s)`}
      className="w-screen h-screen max-w-none max-h-none rounded-none p-6"
    >
      <div className="mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              No se encontraron CRPs.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => {
                  handleSelectCRP(group.groupName);
                  setShowAllCRPs(false);
                }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 group-hover:text-(--blueColor) transition truncate">
                    {group.groupName}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 ${
                      group.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {group.status ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 truncate">
                  {group.employee.user.person.firstNames} {group.employee.user.person.lastNames}
                </p>
                <span className="text-xs text-gray-400">
                  {group.totalStudents ?? 0} estudiante(s)
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </DialogComponent>
    </>
  );
}
