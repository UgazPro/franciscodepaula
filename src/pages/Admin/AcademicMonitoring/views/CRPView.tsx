import { useState, useMemo, useEffect } from "react";
import { Loader2, Plus, LayoutGrid, LayoutList, Edit3, Users, ArrowLeft, UserPlus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
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
import { specialGroupColumns } from "@/services/teacher-assignment/teacher-assignment.tables";
import type { SpecialGroupResponse, CRPStudentResponse, AvailableStudentResponse } from "@/services/teacher-assignment/teacher-assignment.types";
import type { FormField } from "@/components/form/formComponent.interface";
import type { Column } from "@/components/table/TableComponent";
import SearchFilterComponent from "@/components/filters/SearchFilter";

interface CRPViewProps {
  tabsComponent?: React.ReactNode;
}

export default function CRPView({ tabsComponent }: CRPViewProps) {
  const [screen, setScreen] = useState<"list" | "students" | "form">("list");
  const [previousScreen, setPreviousScreen] = useState<"list" | "students">("list");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [editingGroup, setEditingGroup] = useState<SpecialGroupResponse | null>(null);
  const [selectedCRP, setSelectedCRP] = useState<string | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([]);
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
    const data = (groupsData as any)?.data ?? (Array.isArray(groupsData) ? groupsData : []);
    return data.filter((g: SpecialGroupResponse) => g.status !== null);
  }, [groupsData]);

  const teachers = useMemo(() => {
    const data = (teachersData as any)?.data ?? (Array.isArray(teachersData) ? teachersData : []);
    return data;
  }, [teachersData]);

  const students = useMemo(() => {
    const data = (studentsData as any)?.data ?? (Array.isArray(studentsData) ? studentsData : []);
    return data;
  }, [studentsData]);

  const availableStudents = useMemo(() => {
    const data = (availableStudentsData as any)?.data ?? (Array.isArray(availableStudentsData) ? availableStudentsData : []);
    return data;
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

  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return groups.slice(start, start + itemsPerPage);
  }, [groups, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [groups.length]);

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
    options: teachers.map((t: any) => ({
      label: `${t.person.firstNames} ${t.person.lastNames}`,
      value: t.employee.id,
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
        const existingGroups = groups.filter((g: SpecialGroupResponse) => g.groupName === editingGroup.groupName);
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

  const handleToggleEnrollment = (enrollmentId: number) => {
    setSelectedEnrollments((prev) =>
      prev.includes(enrollmentId)
        ? prev.filter((id) => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const handleAssignStudents = async () => {
    if (!selectedCRP || selectedEnrollments.length === 0) return;
    try {
      await addStudents({ groupName: selectedCRP, studentEnrollmentIds: selectedEnrollments });
      setSelectedEnrollments([]);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleRemoveStudent = async (studentEnrollmentId: number) => {
    if (!selectedCRP) return;
    try {
      await removeStudent({ groupName: selectedCRP, studentEnrollmentId });
    } catch {
      // interceptor handles the toast
    }
  };

  const studentColumns: Column<CRPStudentResponse>[] = [
    {
      header: "Nombre",
      render: (row) => (
        <span className="font-medium text-gray-800">
          {row.studentEnrollment.student.person.firstNames} {row.studentEnrollment.student.person.lastNames}
        </span>
      ),
    },
    {
      header: "Cédula",
      render: (row) => (
        <span className="text-gray-600">{row.studentEnrollment.student.person.identificationNumber}</span>
      ),
    },
    {
      header: "Sección",
      render: (row) => (
        <span className="text-gray-600">
          {row.studentEnrollment.section.highSchoolLevel.level} — {row.studentEnrollment.section.section}
        </span>
      ),
    },
    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <button
          onClick={() => handleRemoveStudent(row.studentEnrollmentId)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
          title="Remover del CRP"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  const availableStudentColumns: Column<AvailableStudentResponse & { selected?: boolean }>[] = [
    {
      header: "",
      className: "w-10",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedEnrollments.includes(row.id)}
          onChange={() => handleToggleEnrollment(row.id)}
          className="w-4 h-4 text-(--blueColor) border-gray-300 rounded focus:ring-(--blueColor) cursor-pointer"
        />
      ),
    },
    {
      header: "Nombre",
      render: (row) => (
        <span className="font-medium text-gray-800">
          {row.student.person.firstNames} {row.student.person.lastNames}
        </span>
      ),
    },
    {
      header: "Cédula",
      render: (row) => (
        <span className="text-gray-600">{row.student.person.identificationNumber}</span>
      ),
    },
    {
      header: "Sección",
      render: (row) => (
        <span className="text-gray-600">
          {row.section.highSchoolLevel.level} — {row.section.section}
        </span>
      ),
    },
  ];

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
                    {groups.length} CRP(s) registrado(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              No hay grupos CRP registrados. Haz clic en "Crear CRP" para crear uno.
            </div>
          ) : viewMode === "card" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedGroups.map((group: SpecialGroupResponse) => (
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
                        {group._count?.studentGroups ?? 0} estudiante(s)
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(group); }}
                          className="p-2 text-gray-400 hover:text-(--blueColor) hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Editar CRP"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={groups.length}
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
                  totalItems={groups.length}
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
                    const group = groups.find((g: SpecialGroupResponse) => g.groupName === selectedCRP);
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
