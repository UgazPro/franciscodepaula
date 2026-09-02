import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePayrollPeriod } from "@/queries/usePayrollMutations";
import type { PayrollHalf } from "@/services/payroll/payroll.types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface PayrollPeriodFormProps {
  onBack: () => void;
}

export default function PayrollPeriodForm({ onBack }: PayrollPeriodFormProps) {
  const { mutateAsync: createPeriod, isPending } = useCreatePayrollPeriod();

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [half, setHalf] = useState<PayrollHalf>("FIRST_HALF");

  const getHalfDates = () => {
    const lastDay = new Date(year, month, 0).getDate();
    if (half === "FIRST_HALF") {
      return { startDate: `${year}-${String(month).padStart(2, "0")}-01`, endDate: `${year}-${String(month).padStart(2, "0")}-15` };
    }
    return { startDate: `${year}-${String(month).padStart(2, "0")}-16`, endDate: `${year}-${String(month).padStart(2, "0")}-${lastDay}` };
  };

  const handleSubmit = async () => {
    const dates = getHalfDates();
    try {
      await createPeriod({ month, year, half, ...dates });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Mes</label>
            <select value={month} onChange={(e) => setMonth(+e.target.value)}
              className="w-full h-10 px-3 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor)">
              {MONTHS.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Año</label>
            <input type="number" value={year} onChange={(e) => setYear(+e.target.value)}
              className="w-full h-10 px-3 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Quincena</label>
            <select value={half} onChange={(e) => setHalf(e.target.value as PayrollHalf)}
              className="w-full h-10 px-3 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor)">
              <option value="FIRST_HALF">Primera Quincena (1-15)</option>
              <option value="SECOND_HALF">Segunda Quincena (16-fin)</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p><strong>Período:</strong> {MONTHS[month - 1]} {year} - {half === "FIRST_HALF" ? "Primera Quincena" : "Segunda Quincena"}</p>
          <p><strong>Fechas:</strong> {getHalfDates().startDate} al {getHalfDates().endDate}</p>
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
