import { Plus, Edit3, Loader2, BookOpen, Power } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";
import { useSubjects } from "@/hooks/useSubjects";
import { useCreateSubject, useUpdateSubject, useToggleSubjectStatus } from "@/queries/useSubjectMutations";
import { subjectSchema, type SubjectFormValues } from "@/services/subject/subject.schema";
import { subjectFieldsByName } from "@/services/subject/subjectForm.data";
import type { Column } from "@/components/table/TableComponent";
import type { SubjectResponse } from "@/services/subject/subject.types";

export default function SubjectsView() {
  const { data: subjects = [], isLoading } = useSubjects();
  const { mutateAsync: createSubject } = useCreateSubject();
  const { mutateAsync: updateSubject } = useUpdateSubject();
  const { mutateAsync: toggleSubjectStatus } = useToggleSubjectStatus();

  const [screen, setScreen] = useState<"list" | "form">("list");
  const [editingSubject, setEditingSubject] = useState<SubjectResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const allSubjects = (subjects as SubjectResponse[]).filter(
    (s) => s.subject
  );

  const totalPages = Math.max(1, Math.ceil(allSubjects.length / itemsPerPage));
  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allSubjects.slice(start, start + itemsPerPage);
  }, [allSubjects, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [allSubjects.length, itemsPerPage]);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { subject: "", code: "" },
  });

  const handleCreate = () => {
    setEditingSubject(null);
    form.reset({ subject: "", code: "" });
    setScreen("form");
  };

  const handleEdit = (subject: SubjectResponse) => {
    form.reset({ subject: subject.subject, code: subject.code ?? "" });
    setEditingSubject(subject);
    setScreen("form");
  };

  const handleDelete = async (subject: SubjectResponse) => {
    try {
      await toggleSubjectStatus(subject.id);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleSave = async (data: SubjectFormValues) => {
    try {
      if (editingSubject) {
        await updateSubject({ id: editingSubject.id, data });
      } else {
        await createSubject(data);
      }
      setScreen("list");
      setEditingSubject(null);
      form.reset({ subject: "", code: "" });
    } catch {
      // interceptor handles the toast
    }
  };

  const handleBack = () => {
    form.reset({ subject: "", code: "" });
    setScreen("list");
    setEditingSubject(null);
  };

  const columns: Column<SubjectResponse>[] = [
    { header: "Materia", accessor: "subject", className: "font-medium text-gray-800" },
    {
      header: "Código",
      render: (row) => (
        <span className="font-mono text-gray-600">{row.code ?? "—"}</span>
      ),
    },
    {
      header: "Estado",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            row.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {row.status ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      header: "Acciones",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-500 hover:text-(--blueColor) hover:bg-blue-50 rounded-lg transition cursor-pointer"
          >
            <Edit3 size={16} />
          </button>
          <DeleteDialog
            preposition="la materia"
            whatsDeleting={row.subject}
            onConfirm={() => handleDelete(row)}
            buttonType="ghost"
            buttonStyles="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer"
            bigMessage={row.subject}
            icon={<Power size={28} />}
            confirmText="Desactivar"
            title={`¿Desactivar ${row.subject}?`}
            description={`¿Estás seguro de que deseas desactivar ${row.subject}? La materia quedará oculta pero no se eliminará permanentemente.`}
            iconBgClass="bg-orange-100"
            iconColorClass="text-orange-600"
            confirmClass="bg-orange-500 hover:bg-orange-600"
          />
        </div>
      ),
    },
  ];

  const f = subjectFieldsByName;

  const summaryList = (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-purple-900 to-purple-800 rounded-xl">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Materias</h1>
              <p className="text-sm text-gray-500">
                {allSubjects.length} materia(s) registrada(s) en el sistema
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
          >
            <Plus size={18} />
            Agregar Materia
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando materias...
        </div>
      ) : allSubjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No hay materias registradas. Haz clic en "Agregar Materia" para crear una.
        </div>
      ) : (
        <>
          <TableComponent data={paginatedSubjects as SubjectResponse[]} columns={columns} maxHeight={464} />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allSubjects.length}
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
          <Edit3 size={20} className="text-(--darkBlueColor)" />
        </button>
        <h2 className="text-lg font-semibold text-(--darkBlueColor)">
          {editingSubject ? "Editar Materia" : "Nueva Materia"}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldRenderer field={f.subject} />
            <FieldRenderer field={f.code} />
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-(--lightBlueColor)/20">
            <Button type="button" variant="outline"
              className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
              onClick={handleBack}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer"
            >
              {editingSubject ? "Actualizar materia" : "Crear materia"}
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
