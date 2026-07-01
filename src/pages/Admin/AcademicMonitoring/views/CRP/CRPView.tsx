import { useState, useMemo, useEffect, useCallback } from "react";
import { Loader2, Plus, LayoutGrid, LayoutList, Edit3, Users, ArrowLeft, UserPlus, CircleX } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
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
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useSpecialGroups, useSpecialGroupStudents, useAvailableStudentsForCRP } from "@/hooks/useSpecialGroups";
import { useTeachers } from "@/hooks/useTeacherAssignments";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import {
  useCreateSpecialGroup,
  useUpdateSpecialGroup,
  useToggleSpecialGroupStatus,
  useAddStudentsToSpecialGroup,
  useRemoveStudentFromSpecialGroup,
} from "@/queries/useSpecialGroupMutations";
import { specialGroupSchema, type SpecialGroupFormValues } from "@/services/teacher-assignment/specialGroup.schema";
import { specialGroupColumns, crpStudentColumns, crpAvailableStudentColumns } from "@/services/teacher-assignment/teacher-assignment.tables";
import type { SpecialGroupResponse, CRPStudentResponse, AvailableStudentResponse } from "@/services/teacher-assignment/teacher-assignment.types";
import type { IStaff } from "@/services/users/user.interface";
import type { FormField } from "@/components/form/formComponent.interface";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import TooltipComponent from "@/components/TooltipComponent";

interface CRPViewProps {
  tabsComponent?: React.ReactNode;
}

export default function CRPView({ tabsComponent }: CRPViewProps) {
  const [screen, setScreen] = useState<"list" | "students" | "form">("list");
  const [previousScreen, setPreviousScreen] = useState<"list" | "students">("list");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const [editingGroup, setEditingGroup] = useState<SpecialGroupResponse | null>(null);
  const [selectedCRP, setSelectedCRP] = useState<string | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([]);
  const [studentToRemove, setStudentToRemove] = useState<{ id: number; name: string } | null>(null);
  const [enrolledSearch, setEnrolledSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const { data: groupsData, isLoading } = useSpecialGroups();
  const { data: teachersData } = useTeachers();
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { data: studentsData, isLoading: isLoadingStudents } = useSpecialGroupStudents(selectedCRP);
  const { data: availableStudentsData, isLoading: isLoadingAvailable } = useAvailableStudentsForCRP();

  const { mutateAsync: createGroup } = useCreateSpecialGroup();
  const { mutateAsync: updateGroup } = useUpdateSpecialGroup();
  const { mutateAsync: toggleStatus } = useToggleSpecialGroupStatus();
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

  const teachers = useMemo(() => {
    return Array.isArray(teachersData) ? (teachersData as IStaff[]) : [];
  }, [teachersData]);

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

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / itemsPerPage));
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, currentPage, itemsPerPage]);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const form = useForm<SpecialGroupFormValues>({
    resolver: zodResolver(specialGroupSchema),
    defaultValues: {
      groupName: "",
      teacherId: 0,
      schoolYearId: activeSchoolYear?.id ?? 0,
    },
  });

  useEffect(() => {
    if (activeSchoolYear?.id) {
      form.setValue("schoolYearId", activeSchoolYear.id);
    }
  }, [activeSchoolYear, form]);

  const teacherField: FormField = useMemo(() => ({
    name: "teacherId",
    label: "Profesor",
    type: "select",
    placeholder: "Seleccione un profesor",
    options: teachers.map((t) => ({
      label: `${t.person.firstNames} ${t.person.lastNames}`,
      value: t.employee?.id ?? 0,
    })),
  }), [teachers]);

  const handleCreate = () => {
    setEditingGroup(null);
    form.reset({
      groupName: "",
      teacherId: 0,
      schoolYearId: activeSchoolYear?.id ?? 0,
    });
    setScreen("form");
  };

  const handleEdit = (group: SpecialGroupResponse) => {
    setEditingGroup(group);
    setPreviousScreen(screen as "list" | "students");
    form.reset({
      groupName: group.groupName,
      teacherId: group.teacherId,
      schoolYearId: group.schoolYearId,
    });
    setScreen("form");
  };

  const handleSave = async (data: SpecialGroupFormValues) => {
    try {
      if (editingGroup) {
        const existingGroups = groups.filter((g) => g.groupName === editingGroup.groupName);
        const levelSubjectId = existingGroups[0]?.levelSubjectId ?? 1;
        await updateGroup({ id: editingGroup.id, data: { ...data, levelSubjectId } });
      } else {
        const firstLevelSubjectId = 31;
        await createGroup({ ...data, levelSubjectId: firstLevelSubjectId });
      }
      setScreen("list");
      setEditingGroup(null);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleToggleStatus = async (group: SpecialGroupResponse) => {
    try {
      await toggleStatus(group.id);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleBack = () => {
    if (screen === "form") {
      setScreen(previousScreen);
    }
    setEditingGroup(null);
  };

  const handleBackFromStudents = () => {
    setSelectedCRP(null);
    setSelectedEnrollments([]);
    setScreen("list");
  };

  const handleSelectCRP = (groupName: string) => {
    setSelectedCRP(groupName);
    setSelectedEnrollments([]);
    setScreen("students");
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

  const handleCancelRemove = useCallback(() => {
    setStudentToRemove(null);
  }, []);

  const studentColumns = useMemo(() => crpStudentColumns(handleRemoveStudent), [handleRemoveStudent]);
  const availableStudentColumns = useMemo(() => crpAvailableStudentColumns(selectedEnrollments, handleToggleEnrollment), [selectedEnrollments, handleToggleEnrollment]);

  const toggle = screen !== "list";

  return (
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
                    {filteredGroups.length} CRP(s) registrado(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => { setStatusFilter("inactive"); resetPage(); }}
                    className={`px-3 py-2.5 text-xs font-medium transition cursor-pointer ${
                      statusFilter === "inactive"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Inactivos
                  </button>
                  <button
                    onClick={() => { setStatusFilter("active"); resetPage(); }}
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
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
                >
                  <Plus size={18} />
                  Crear CRP
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
                ? "No hay grupos CRP activos. Haz clic en \"Crear CRP\" para crear uno."
                : "No hay grupos CRP inactivos."
              }
            </div>
          ) : viewMode === "card" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer group"
                  >
                    <div
                      className="flex items-start justify-between mb-4"
                      onClick={() => handleSelectCRP(group.groupName)}
                    >
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
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span
                        className="text-sm text-gray-400"
                        onClick={() => handleSelectCRP(group.groupName)}
                      >
                        {group.totalStudents ?? 0} estudiante(s)
                      </span>
                      <div className="flex items-center gap-1">
                        <TooltipComponent content="Editar CRP">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(group); }}
                            className="p-2 text-gray-400 hover:text-(--blueColor) hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>
                        </TooltipComponent>
                      </div>
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
                columns={specialGroupColumns(handleEdit, handleToggleStatus)}
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
        screen === "form" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-(--lightBlueColor)/20">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer"
              >
                <ArrowLeft size={20} className="text-(--darkBlueColor)" />
              </button>
              <h2 className="text-lg font-semibold text-(--darkBlueColor)">
                {editingGroup ? "Editar CRP" : "Nuevo CRP"}
              </h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRenderer field={{ name: "groupName", label: "Nombre del CRP", type: "text", placeholder: "Ej: Karate, Pintura, Bordado..." }} />
                  <FieldRenderer field={teacherField} />
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-(--lightBlueColor)/20">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
                    onClick={handleBack}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer"
                  >
                    {editingGroup ? "Actualizar CRP" : "Crear CRP"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : screen === "students" && selectedCRP ? (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
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
                <button
                  onClick={() => {
                    const group = groups.find((g) => g.groupName === selectedCRP);
                    if (group) handleEdit(group);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-(--blueColor) hover:bg-blue-50 rounded-lg transition cursor-pointer"
                >
                  <Edit3 size={16} />
                  Editar
                </button>
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
        ) : null
      }
      toggle={toggle}
    />
  );
}
