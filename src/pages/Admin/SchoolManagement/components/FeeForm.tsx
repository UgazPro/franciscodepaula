import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import type { FeeResponse } from "@/services/administration/payments.types";
import { useExchangeRate } from "@/hooks/usePayments";

interface Props {
  fee: FeeResponse | null;
  schoolYear: { id: number; name: string } | null;
  onSave: (data: { name: string; value: number; startAt: Date; endAt: Date }) => Promise<void>;
  onBack: () => void;
}

const FEE_TYPES = ["Inscripción", "Mensualidad"];

export default function FeeForm({ fee, schoolYear, onSave, onBack }: Props) {
  const isEditing = !!fee;
  const { data: latestExchange } = useExchangeRate();
  const exchangeRate = latestExchange?.rate ? Number(latestExchange.rate) : null;

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fee) {
      setName(fee.name);
      setValue(String(fee.value));
      setStartAt(new Date(fee.startAt).toISOString().split("T")[0]);
      setEndAt(new Date(fee.endAt).toISOString().split("T")[0]);
    } else {
      setName(FEE_TYPES[0]);
      setValue("");
      setStartAt("");
      setEndAt("");
    }
  }, [fee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!value || Number(value) <= 0) return;
    if (!startAt) return;
    if (!endAt) return;

    setSaving(true);
    await onSave({
      name: name.trim(),
      value: Number(value),
      startAt: new Date(startAt),
      endAt: new Date(endAt),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--blueColor) hover:text-(--darkBlueColor) transition mb-4 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver a tipos de pago
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {isEditing ? "Editar Tipo de Pago" : "Crear Tipo de Pago"}
        </h2>
        {schoolYear && (
          <p className="text-sm text-gray-500">
            Año Escolar: <span className="font-semibold text-(--blueColor)">{schoolYear.name}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Pago</label>
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
              required
            />
          ) : (
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
              required
            >
              <option value="" disabled>Seleccionar tipo de pago</option>
              {FEE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto (USD $)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Monto en VES (Bs.)
            {!exchangeRate && <span className="text-xs text-gray-400 ml-2">(sin tasa disponible)</span>}
          </label>
          <input
            type="text"
            value={exchangeRate && value ? `Bs. ${(Number(value) * exchangeRate).toFixed(2)}` : "Bs. 0.00"}
            readOnly
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          {exchangeRate && (
            <p className="text-xs text-gray-400 mt-1">Tasa: 1 USD = Bs. {exchangeRate.toFixed(2)}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Inicio</label>
            <input
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Fin</label>
            <input
              type="date"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
