import { Plus, Loader2, BookOpen, Edit3, Power } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SelectComponentForm } from "@/components/form/renderFormComponents/SelectComponent";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";
import { useTeacherAssignments, useTeachers } from "@/hooks/useTeacherAssignments";
import { useSubjects } from "@/hooks/useSubjects";
import { useActiveSchoolYear, useSections } from "@/hooks/useSchoolYears";
import { useCreateTeacherAssignment, useUpdateTeacherAssignment, useToggleTeacherAssignmentStatus } from "@/queries/useTeacherAssignmentMutations";
import type { TeacherAssignmentResponse } from "@/services/teacher-assignment/teacher-assignment.types";

const assignmentSchema = z.object({
  teacherId: z.number({ message: "Seleccione un docente" }),
  subjectId: z.number({ message: "Seleccione una materia" }),
  sectionId: z.number({ message: "Seleccione una sección" }),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function TeacherAssignmentsView() {
  const { data: assignments = [], isLoading } = useTeacherAssignments();
  const { data: teachers = [] } = useTeachers();
  const { data: subjects = [] } = useSubjects();
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { data: allSections = [] } = useSections();
  const { mutateAsync: createAssignment } = useCreateTeacherAssignment();
  const { mutateAsync: updateAssignment } = useUpdateTeacherAssignment();
  const { mutateAsync: toggleAssignmentStatus } = useToggleTeacherAssignmentStatus();

  const [screen, setScreen] = useState<"list" | "form">("list");
  const [editingAssignment, setEditingAssignment] = useState<TeacherAssignmentResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const allAssignments = (assignments as TeacherAssignmentResponse[]).filter(
    (a) => a.employee && a.subject && a.section
  );

  const totalPages = Math.max(1, Math.ceil(allAssignments.length / itemsPerPage));
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allAssignments.slice(start, start + itemsPerPage);
  }, [allAssignments, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [allAssignments.length, itemsPerPage]);

  const activeSections = useMemo(() => {
    if (!activeSchoolYear) return [];
    return (allSections as any[]).filter(
      (s: any) => s.schoolYearId === activeSchoolYear.id
    );
  }, [allSections, activeSchoolYear]);

  const teacherOptions = useMemo(() => {
    return (teachers as any[]).map((t: any) => ({
      label: `${t.person.firstNames} ${t.person.lastNames} — ${t.person.identificationNumber}`,
      value: t.id,
    }));
  }, [teachers]);

  const subjectOptions = useMemo(() => {
    return (subjects as any[]).filter((s: any) => s.status !== false).map((s: any) => ({
      label: `${s.subject}${s.code ? ` (${s.code})` : ""}`,
      value: s.id,
    }));
  }, [subjects]);

  const sectionOptions = useMemo(() => {
    return activeSections.map((s: any) => ({
      label: `${s.highSchoolLevel?.level ?? ""} — ${s.section}`,
      value: s.id,
    }));
  }, [activeSections]);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { teacherId: undefined as any, subjectId: undefined as any, sectionId: undefined as any },
  });

  const handleCreate = () => {
    setEditingAssignment(null);
    form.reset({ teacherId: undefined as any, subjectId: undefined as any, sectionId: undefined as any });
    setScreen("form");
  };

  const handleEdit = (assignment: TeacherAssignmentResponse) => {
    form.reset({
      teacherId: assignment.teacherId,
      subjectId: assignment.subjectId,
      sectionId: assignment.sectionId,
    });
    setEditingAssignment(assignment);
    setScreen("form");
  };

  const handleDelete = async (assignment: TeacherAssignmentResponse) => {
    try {
      await toggleAssignmentStatus(assignment.id);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleSave = async (data: AssignmentFormValues) => {
    try {
      if (editingAssignment) {
        await updateAssignment({ id: editingAssignment.id, data });
      } else {
        await createAssignment(data);
      }
      setScreen("list");
      setEditingAssignment(null);
      form.reset({ teacherId: undefined as any, subjectId: undefined as any, sectionId: undefined as any });
    } catch {
      // interceptor handles the toast
    }
  };

  const handleBack = () => {
    form.reset({ teacherId: undefined as any, subjectId: undefined as any, sectionId: undefined as any });
    setScreen("list");
    setEditingAssignment(null);
  };

  const summaryList = (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-teal-900 to-teal-800 rounded-xl">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Asignación Docente</h1>
              <p className="text-sm text-gray-500">
                {activeSchoolYear
                  ? `Año Escolar: ${activeSchoolYear.name} — ${allAssignments.length} asignación(es)`
                  : "Cargando año escolar..."
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
          >
            <Plus size={18} />
            Nueva Asignación
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando asignaciones...
        </div>
      ) : allAssignments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No hay asignaciones registradas. Haz clic en "Nueva Asignación" para crear una.
        </div>
      ) : (
        <>
          <TableComponent data={paginatedAssignments as TeacherAssignmentResponse[]} columns={[    {      header: "Docente",      render: (row) => (        <div className="flex items-center gap-3">          <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">            {row.employee.user.person.firstNames.charAt(0)}            {row.employee.user.person.lastNames.charAt(0)}          </div>          <div>            <p className="font-medium text-gray-800">              {row.employee.user.person.firstNames} {row.employee.user.person.lastNames}            </p>            <p className="text-xs text-gray-400">{row.employee.user.person.identificationNumber}</p>          </div>        </div>      ),    },    {      header: "Materia",      render: (row) => (        <span className="font-medium text-gray-800">{row.subject.subject}</span>      ),    },    {      header: "Nivel / Sección",      render: (row) => (        <span className="text-gray-600">          {row.section.highSchoolLevel.level} — {row.section.section}        </span>      ),    },    {      header: "Estado",      render: (row) => (        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>          {row.status ? "Activa" : "Inactiva"}        </span>      ),    },    {      header: "Acciones",      headerClassName: "text-right",      className: "text-right",      render: (row) => (        <div className="flex items-center justify-end gap-1">          <button type="button" onClick={() => handleEdit(row)} className="p-2 text-gray-500 hover:text-(--blueColor) hover:bg-blue-50 rounded-lg transition cursor-pointer">            <Edit3 size={16} />          </button>          <DeleteDialog            preposition="la asignación"            whatsDeleting={`${row.employee.user.person.firstNames} ${row.employee.user.person.lastNames} — ${row.subject.subject}`}            onConfirm={() => handleDelete(row)}            buttonType="ghost"            buttonStyles="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer"            icon={<Power size={28} />}            confirmText="Desactivar"            title={`¿Desactivar asignación?`}            description={`¿Estás seguro de que deseas desactivar la asignación de ${row.employee.user.person.firstNames} ${row.employee.user.person.lastNames} a ${row.subject.subject}?`}            iconBgClass="bg-orange-100"            iconColorClass="text-orange-600"            confirmClass="bg-orange-500 hover:bg-orange-600"          />        </div>      ),    },  ]} maxHeight={464} />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allAssignments.length}
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
        <button type="button" onClick={handleBack} className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer">
          <BookOpen size={20} className="text-(--darkBlueColor)" />
        </button>
        <h2 className="text-lg font-semibold text-(--darkBlueColor)">
          {editingAssignment ? "Editar Asignación" : "Nueva Asignación"}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectComponentForm
              form={form}
              name="teacherId"
              label="Docente"
              placeholder="Seleccione un docente"
              options={teacherOptions}
            />
            <SelectComponentForm
              form={form}
              name="subjectId"
              label="Materia"
              placeholder="Seleccione una materia"
              options={subjectOptions}
            />
            <SelectComponentForm
              form={form}
              name="sectionId"
              label="Sección"
              placeholder="Seleccione una sección"
              options={sectionOptions}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-(--lightBlueColor)/20">
            <Button type="button" variant="outline"
              className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
              onClick={handleBack}>
              Cancelar
            </Button>
            <Button type="submit"
              className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer">
              {editingAssignment ? "Actualizar asignación" : "Crear asignación"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  return (
    <PageTransitionComponent
      primaryChildren={summaryList}
      secondaryChildren={formView}
      toggle={screen === "form"}
    />
  );
}
