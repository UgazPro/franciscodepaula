import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePayrollPeriod } from "@/queries/usePayrollMutations";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";

interface PayrollPeriodFormProps {
  onBack: () => void;
}

export default function PayrollPeriodForm({ onBack }: PayrollPeriodFormProps) {
  const { mutateAsync: createPeriod, isPending } = useCreatePayrollPeriod();
  const { data: activeSchoolYear } = useActiveSchoolYear();

  const [payrollHalf, setPayrollHalf] = useState<number>(1);
  const [schoolYearId, setSchoolYearId] = useState<number>(activeSchoolYear?.id ?? 1);

  const halfLabel = payrollHalf === 1 ? "Primera Quincena" : "Segunda Quincena";

  const handleSubmit = async () => {
    try {
      await createPeriod({ payrollHalf, schoolYearId });
      onBack();
    } catch {
      // interceptor handles the toast
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer">
            <ArrowLeft size={20} className="text-(--darkBlueColor)" />
          </button>
          <h2 className="text-lg font-semibold text-(--darkBlueColor)">Crear Período de Nómina</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Quincena</label>
            <select value={payrollHalf} onChange={(e) => setPayrollHalf(+e.target.value)}
              className="w-full h-10 px-3 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor)">
              <option value={1}>Primera Quincena (1ra)</option>
              <option value={2}>Segunda Quincena (2da)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Año Escolar</label>
            <input type="text" value={activeSchoolYear?.name ?? "—"} disabled
              className="w-full h-10 px-3 border border-(--lightBlueColor)/30 rounded-lg bg-gray-50 text-gray-500" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p><strong>Período:</strong> Quincena {payrollHalf} — {halfLabel}</p>
          <p><strong>Año Escolar:</strong> {activeSchoolYear?.name ?? "—"}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="cursor-pointer">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}
            className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md cursor-pointer disabled:opacity-50">
            {isPending ? "Creando..." : "Crear Período"}
          </Button>
        </div>
      </div>
    </div>
  );
}
