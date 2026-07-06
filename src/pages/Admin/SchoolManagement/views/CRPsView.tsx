import { Plus, Edit3, Loader2, Users } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { useSpecialGroups } from "@/hooks/useSpecialGroups";
import { useTeachers } from "@/hooks/useTeacherAssignments";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import {
  useCreateSpecialGroup,
  useUpdateSpecialGroup,
  useToggleSpecialGroupStatus,
} from "@/queries/useSpecialGroupMutations";
import { specialGroupSchema, type SpecialGroupFormValues } from "@/services/teacher-assignment/specialGroup.schema";
import { specialGroupColumns } from "@/services/teacher-assignment/teacher-assignment.tables";
import type { SpecialGroupResponse } from "@/services/teacher-assignment/teacher-assignment.types";
import type { IStaff } from "@/services/users/user.interface";
import type { FormField } from "@/components/form/formComponent.interface";

interface CRPsViewProps {
  tabsComponent?: React.ReactNode;
}

export default function CRPsView({ tabsComponent }: CRPsViewProps) {
  const [screen, setScreen] = useState<"list" | "form">("list");
  const [editingGroup, setEditingGroup] = useState<SpecialGroupResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  const { data: groupsData, isLoading } = useSpecialGroups();
  const { data: teachersData } = useTeachers();
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { mutateAsync: createGroup } = useCreateSpecialGroup();
  const { mutateAsync: updateGroup } = useUpdateSpecialGroup();
  const { mutateAsync: toggleStatus } = useToggleSpecialGroupStatus();

  const groups = useMemo(() => {
    const response = groupsData as { data: SpecialGroupResponse[] } | undefined;
    const data = response?.data ?? (Array.isArray(groupsData) ? (groupsData as SpecialGroupResponse[]) : []);
    return data.filter((g) => g.status !== null);
  }, [groupsData]);

  const teachers = useMemo(() => {
    return Array.isArray(teachersData) ? (teachersData as IStaff[]) : [];
  }, [teachersData]);

  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return groups.slice(start, start + itemsPerPage);
  }, [groups, currentPage, itemsPerPage]);

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

  const handleEdit = useCallback((group: SpecialGroupResponse) => {
    setEditingGroup(group);
    form.reset({
      groupName: group.groupName,
      teacherId: group.teacherId,
      schoolYearId: group.schoolYearId,
    });
    setScreen("form");
  }, [form]);

  const handleDelete = useCallback(async (group: SpecialGroupResponse) => {
    try {
      await toggleStatus(group.id);
    } catch {
      // interceptor handles the toast
    }
  }, [toggleStatus]);

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
      form.reset({ groupName: "", teacherId: 0, schoolYearId: activeSchoolYear?.id ?? 0 });
    } catch {
      // interceptor handles the toast
    }
  };

  const handleBack = () => {
    form.reset({ groupName: "", teacherId: 0, schoolYearId: activeSchoolYear?.id ?? 0 });
    setScreen("list");
    setEditingGroup(null);
  };

  const columns = useMemo(
    () => specialGroupColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  const summaryList = (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-purple-900 to-purple-800 rounded-xl">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Grupos CRP</h1>
              <p className="text-sm text-gray-500">
                {groups.length} CRP(s) registrado(s) en el sistema
              </p>
            </div>
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

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando grupos CRP...
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No hay grupos CRP registrados. Haz clic en "Crear CRP" para crear uno.
        </div>
      ) : (
        <>
          <TableComponent data={paginatedGroups} columns={columns} maxHeight={464} />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={groups.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        </>
      )}
    </div>
  );

  const formView = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-(--lightBlueColor)/20">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer"
        >
          <Edit3 size={20} className="text-(--darkBlueColor)" />
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
  );

  return (
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}
          {summaryList}
        </>
      }
      secondaryChildren={formView}
      toggle={screen === "form"}
    />
  );
}
