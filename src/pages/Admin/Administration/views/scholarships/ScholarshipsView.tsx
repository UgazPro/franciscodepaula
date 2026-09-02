import { useState, useMemo } from "react";
import { Plus, Search, Trash2, CircleX } from "lucide-react";
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
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useScholarships } from "@/hooks/useScholarships";
import { useDeleteScholarship, useUpdateScholarship } from "@/queries/useScholarshipMutations";
import { useUserData } from "@/helpers/token";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import ScholarshipForm from "./ScholarshipForm";
import type { StudentScholarshipResponse } from "@/services/administration/scholarships.types";

export default function ScholarshipsView() {
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const user = useUserData();
  const { data: scholarshipsData, isLoading } = useScholarships(activeSchoolYear?.id);
  const { mutateAsync: deleteScholarship } = useDeleteScholarship();
  const { mutateAsync: updateScholarship } = useUpdateScholarship();

  const [screen, setScreen] = useState<"list" | "form">("list");
  const [formKey, setFormKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deletingItem, setDeletingItem] = useState<StudentScholarshipResponse | null>(null);
  const [cancellingItem, setCancellingItem] = useState<StudentScholarshipResponse | null>(null);

  const scholarships = useMemo(() => {
    const raw = (scholarshipsData?.data ?? []) as StudentScholarshipResponse[];
    if (!searchTerm) return raw;
    const term = searchTerm.toLowerCase();
    return raw.filter((s) => {
      const name = `${s.student.person.firstNames} ${s.student.person.lastNames}`.toLowerCase();
      const ci = (s.student.person.identificationNumber ?? "").toLowerCase();
      return name.includes(term) || ci.includes(term);
    });
  }, [scholarshipsData, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(scholarships.length / itemsPerPage));
  const paginatedScholarships = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return scholarships.slice(start, start + itemsPerPage);
  }, [scholarships, currentPage, itemsPerPage]);

  const assignedById = user?.id ?? 0;

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteScholarship(deletingItem.id);
      setDeletingItem(null);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleCancel = async () => {
    if (!cancellingItem) return;
    try {
      await updateScholarship({
        id: cancellingItem.id,
        data: {
          status: false,
          endDate: new Date().toISOString(),
        },
      });
      setCancellingItem(null);
    } catch {
      // interceptor handles the toast
    }
  };

  const columns: Column<StudentScholarshipResponse>[] = [
    {
      header: "N",
      render: (_row, index) => <span className="text-gray-500">{(currentPage - 1) * itemsPerPage + (index ?? 0) + 1}</span>,
      className: "w-12",
    },
    {
      header: "Cédula",
      render: (row) => <span className="text-gray-600">{row.student.person.identificationNumber}</span>,
    },
    {
      header: "Nombres",
      render: (row) => <span className="font-medium text-gray-800">{row.student.person.firstNames}</span>,
    },
    {
      header: "Apellidos",
      render: (row) => <span className="text-gray-600">{row.student.person.lastNames}</span>,
    },
    {
      header: "Beca",
      render: (row) => <span className="font-bold text-green-600">$ {Math.floor(Number(row.amount))}</span>,
    },
    {
      header: "Asignada por",
      render: (row) => {
        const person = row.assignedBy?.user?.person;
        return <span className="text-gray-600">{person ? `${person.firstNames} ${person.lastNames}` : "—"}</span>;
      },
    },
    {
      header: "Fecha Asignación",
      render: (row) => <span className="text-gray-600">{new Date(row.assignedDate).toLocaleDateString("es-ES")}</span>,
    },
    {
      header: "Fecha Inicio",
      render: (row) => <span className="text-gray-600">{new Date(row.startDate).toLocaleDateString("es-ES")}</span>,
    },
    {
      header: "Fecha Fin",
      render: (row) => row.endDate ? <span className="text-gray-600">{new Date(row.endDate).toLocaleDateString("es-ES")}</span> : <span className="text-gray-400">—</span>,
    },
    {
      header: "Estado",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          {row.status ? "Activa" : "Cancelada"}
        </span>
      ),
    },
    {
      header: "Acciones",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setDeletingItem(row); }}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCancellingItem(row); }}
                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
              >
                <CircleX size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const tableContent = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
            />
          </div>
          <button
            onClick={() => { setFormKey((k) => k + 1); setScreen("form"); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
          >
            <Plus size={18} />
            Asignar Beca
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          Cargando becas...
        </div>
      ) : scholarships.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No hay becas asignadas para el año escolar actual.
        </div>
      ) : (
        <>
          <TableComponent
            data={paginatedScholarships}
            columns={columns}
            maxHeight={464}
          />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={scholarships.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        </>
      )}

      {deletingItem && (
        <DeleteDialog
          preposition="la beca"
          whatsDeleting={`beca de ${deletingItem.student.person.firstNames} ${deletingItem.student.person.lastNames}`}
          onConfirm={handleDelete}
          buttonType="ghost"
          buttonStyles="hidden"
          bigMessage={`¿Eliminar la beca de ${deletingItem.student.person.firstNames} ${deletingItem.student.person.lastNames}?`}
        />
      )}

      <AlertDialog open={!!cancellingItem} onOpenChange={(open) => { if (!open) setCancellingItem(null); }}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md p-0 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-100">
              <CircleX size={28} className="text-orange-600" />
            </div>
            <AlertDialogHeader className="items-center text-center">
              <AlertDialogTitle className="w-full text-center text-xl font-bold text-gray-800 mb-2">
                ¿Cancelar beca?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 text-center">
                ¿Estás seguro de que deseas cancelar la beca de{" "}
                <strong>{cancellingItem?.student.person.firstNames} {cancellingItem?.student.person.lastNames}</strong>?
                La beca quedará inactiva y no podrá ser editada ni eliminada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 mt-6">
              <AlertDialogCancel className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const formContent = (
    <ScholarshipForm
      key={formKey}
      scholarship={null}
      schoolYearId={activeSchoolYear?.id ?? 0}
      assignedById={assignedById}
      onBack={() => setScreen("list")}
    />
  );

  return (
    <PageTransitionComponent
      primaryChildren={tableContent}
      secondaryChildren={formContent}
      toggle={screen === "form"}
    />
  );
}
