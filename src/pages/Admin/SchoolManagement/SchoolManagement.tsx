import { Plus, Edit3, Trash2, Loader2, School as SchoolIcon } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useFees, useExchangeRate } from "@/hooks/usePayments";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useCreateFee, useUpdateFee, useDeleteFee } from "@/queries/useFeeMutations";
import type { FeeResponse } from "@/services/administration/payments.types";
import type { Column } from "@/components/table/TableComponent";
import { TableComponent } from "@/components/table/TableComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import FeeForm from "./components/FeeForm";
import { PaginationComponent } from "@/components/table/PaginationComponent";

export default function SchoolManagement() {
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { data: fees = [], isLoading } = useFees();
  const { data: latestExchange } = useExchangeRate();
  const exchangeRate = latestExchange?.rate ? Number(latestExchange.rate) : null;
  const { mutateAsync: createFee } = useCreateFee();
  const { mutateAsync: updateFee } = useUpdateFee();
  const { mutateAsync: deleteFee } = useDeleteFee();

  const [screen, setScreen] = useState<"list" | "form">("list");
  const [editingFee, setEditingFee] = useState<FeeResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const currentSchoolYearFees = useMemo(() => {
    if (!activeSchoolYear) return [];
    return (fees as FeeResponse[]).filter((f) => f.schoolYearId === activeSchoolYear.id);
  }, [fees, activeSchoolYear]);

  const totalPages = Math.max(1, Math.ceil(currentSchoolYearFees.length / itemsPerPage));
  const paginatedFees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentSchoolYearFees.slice(start, start + itemsPerPage);
  }, [currentSchoolYearFees, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentSchoolYearFees.length, itemsPerPage]);

  const columns: Column<FeeResponse>[] = [
    { header: "Tipo de Pago", accessor: "name", className: "font-medium text-gray-800" },
    { header: "Monto (USD)", render: (row) => `$ ${Number(row.value).toFixed(2)}` },
    {
      header: "Monto (VES)",
      render: (row) =>
        exchangeRate ? `Bs. ${(Number(row.value) * exchangeRate).toFixed(2)}` : "—",
    },
    {
      header: "Fecha Inicio",
      render: (row) => new Date(row.startAt).toLocaleDateString("es-ES"),
    },
    {
      header: "Fecha Fin",
      render: (row) => new Date(row.endAt).toLocaleDateString("es-ES"),
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
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    setEditingFee(null);
    setScreen("form");
  };

  const handleEdit = (fee: FeeResponse) => {
    setEditingFee(fee);
    setScreen("form");
  };

  const handleDelete = async (fee: FeeResponse) => {
    if (!confirm(`¿Eliminar el tipo de pago "${fee.name}"?`)) return;
    try {
      await deleteFee(fee.id);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleSave = async (data: {
    name: string;
    value: number;
    startAt: Date;
    endAt: Date;
  }) => {
    if (!activeSchoolYear) return;

    try {
      if (editingFee) {
        await updateFee({ id: editingFee.id, data });
      } else {
        await createFee({
          ...data,
          schoolYearId: activeSchoolYear.id,
        });
      }

      setScreen("list");
      setEditingFee(null);
    } catch {
      // interceptor handles the toast
    }
  };

  const handleBack = () => {
    setScreen("list");
    setEditingFee(null);
  };

  const summaryList = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-blue-900 to-blue-800 rounded-xl">
              <SchoolIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Gestión Escolar</h1>
              {activeSchoolYear ? (
                <p className="text-sm text-gray-500">
                  Año Escolar Actual: <span className="font-semibold text-(--blueColor)">{activeSchoolYear.name}</span>
                  {" — "}
                  {new Date(activeSchoolYear.startDate).toLocaleDateString("es-ES")} al{" "}
                  {new Date(activeSchoolYear.endDate).toLocaleDateString("es-ES")}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Cargando año escolar...</p>
              )}
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
          >
            <Plus size={18} />
            Agregar Tipo de Pago
          </button>
        </div>
      </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            Cargando...
          </div>
        ) : currentSchoolYearFees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
            No hay tipos de pago configurados para el año escolar actual. Haz clic en "Agregar Tipo de Pago" para crear uno.
          </div>
        ) : (
          <>
            <TableComponent data={paginatedFees as FeeResponse[]} columns={columns} />
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={currentSchoolYearFees.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </>
        )}
    </div>
  );

  return (
    <PageTransitionComponent
      primaryChildren={summaryList}
      secondaryChildren={
        <FeeForm
          fee={editingFee}
          schoolYear={activeSchoolYear ? { id: activeSchoolYear.id, name: activeSchoolYear.name } : null}
          onSave={handleSave}
          onBack={handleBack}
        />
      }
      toggle={screen === "form"}
    />
  );
}
