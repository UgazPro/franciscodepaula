import { X } from "lucide-react";
import type { PaymentMethod } from "@/services/administration/payments.types";

interface PaymentAccountCardProps {
  paymentMethodId: number;
  amount: number;
  reference: string;
  zellePayer: string;
  paymentMethods: PaymentMethod[];
  onUpdate: (data: { paymentMethodId: number; amount: number; reference: string; zellePayer: string }) => void;
  onRemove: () => void;
  showReference?: boolean;
}

export default function PaymentAccountCard({
  paymentMethodId,
  amount,
  reference,
  zellePayer,
  paymentMethods,
  onUpdate,
  onRemove,
  showReference = true,
}: PaymentAccountCardProps) {
  const selectedMethod = paymentMethods.find((pm) => pm.id === paymentMethodId);
  const currency = selectedMethod?.paymentType?.currency ?? "USD";
  const typeName = selectedMethod?.paymentType?.type ?? "—";

  return (
    <div className="border border-(--lightBlueColor)/20 rounded-lg p-4 bg-white relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-lg transition cursor-pointer text-gray-400 hover:text-red-500"
      >
        <X size={14} />
      </button>

      <div className="mb-3">
        <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
          Cuenta de Pago <span className="text-red-500">*</span>
        </label>
        <select
          value={paymentMethodId || ""}
          onChange={(e) => onUpdate({ paymentMethodId: Number(e.target.value), amount, reference, zellePayer })}
          className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm bg-white"
        >
          <option value="">Seleccione cuenta...</option>
          {paymentMethods
            .filter((pm) => pm.active)
            .map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.paymentType?.type} - {pm.bank ?? "N/A"} {pm.accountNumber ? `(${pm.accountNumber})` : ""} {pm.owner ? `- ${pm.owner}` : ""}
              </option>
            ))}
        </select>
      </div>

      {selectedMethod && (
        <>
          <div className="bg-(--lightBlueColor)/5 border border-(--lightBlueColor)/15 rounded-lg p-3 mb-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Tipo:</span>
                <span className="ml-1 text-gray-700">{typeName}</span>
              </div>
              <div>
                <span className="text-gray-400">Moneda:</span>
                <span className={`ml-1 font-medium ${currency === "VES" ? "text-blue-700" : "text-green-700"}`}>
                  {currency}
                </span>
              </div>
              {selectedMethod.bank && (
                <div>
                  <span className="text-gray-400">Banco:</span>
                  <span className="ml-1 text-gray-700">{selectedMethod.bank}</span>
                </div>
              )}
              {selectedMethod.accountNumber && (
                <div>
                  <span className="text-gray-400">Cuenta:</span>
                  <span className="ml-1 text-gray-700 font-mono">{selectedMethod.accountNumber}</span>
                </div>
              )}
              {selectedMethod.owner && (
                <div className="col-span-2">
                  <span className="text-gray-400">Titular:</span>
                  <span className="ml-1 text-gray-700">{selectedMethod.owner}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
              Monto a Pagar <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                {currency === "VES" ? "Bs." : "$"}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount || ""}
                onChange={(e) => onUpdate({ paymentMethodId, amount: parseFloat(e.target.value) || 0, reference, zellePayer })}
                placeholder="0.00"
                className="flex-1 px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
              />
            </div>
          </div>

          {showReference && (
            <div>
              <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                Referencia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => onUpdate({ paymentMethodId, amount, reference: e.target.value, zellePayer })}
                placeholder="Número de referencia"
                className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
              />
            </div>
          )}

          {typeName.toLowerCase() === "zelle" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                Nombre en Zelle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={zellePayer}
                onChange={(e) => onUpdate({ paymentMethodId, amount, reference, zellePayer: e.target.value })}
                placeholder="Nombre y apellido de quien paga"
                className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
