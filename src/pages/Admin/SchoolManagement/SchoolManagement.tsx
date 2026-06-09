import { Plus, Edit3, Trash2, Loader2, School as SchoolIcon } from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useFees, useExchangeRate } from "@/hooks/usePayments";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useCreateFee, useUpdateFee, useDeleteFee } from "@/queries/useFeeMutations";
import type { FeeResponse } from "@/services/administration/payments.types";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import FeeForm from "./components/FeeForm";

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

  const currentSchoolYearFees = useMemo(() => {
    if (!activeSchoolYear) return [];
    return (fees as FeeResponse[]).filter((f) => f.schoolYearId === activeSchoolYear.id);
  }, [fees, activeSchoolYear]);

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
      const result = await deleteFee(fee.id);
      if (result && !result.success) {
        toast.error(result.message ?? "Error al eliminar");
        return;
      }
      toast.success("Tipo de pago eliminado");
    } catch {
      toast.error("Error al eliminar el tipo de pago");
    }
  };

  const handleSave = async (data: {
    name: string;
    value: number;
    startAt: Date;
    endAt: Date;
  }) => {
    if (!activeSchoolYear) {
      toast.error("No hay un año escolar activo");
      return;
    }

    try {
      let result: any;

      if (editingFee) {
        result = await updateFee({ id: editingFee.id, data });
      } else {
        result = await createFee({
          ...data,
          schoolYearId: activeSchoolYear.id,
        });
      }

      if (result && !result.success) {
        toast.error(result.message ?? "Error al guardar");
        return;
      }

      toast.success(editingFee ? "Tipo de pago actualizado" : "Tipo de pago creado");
      setScreen("list");
      setEditingFee(null);
    } catch {
      toast.error("Error al guardar el tipo de pago");
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Tipos de Pago del Año Escolar</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            Cargando...
          </div>
        ) : currentSchoolYearFees.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No hay tipos de pago configurados para el año escolar actual. Haz clic en "Agregar Tipo de Pago" para crear uno.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo de Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto (USD)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto (VES)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Inicio</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Fin</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(currentSchoolYearFees as FeeResponse[]).map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{fee.name}</td>
                    <td className="px-6 py-4 text-gray-700">$ {Number(fee.value).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-700">
                      Bs. {exchangeRate ? (Number(fee.value) * exchangeRate).toFixed(2) : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(fee.startAt).toLocaleDateString("es-ES")}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(fee.endAt).toLocaleDateString("es-ES")}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(fee)}
                          className="p-2 text-gray-500 hover:text-(--blueColor) hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(fee)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
