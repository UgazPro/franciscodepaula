import type { FeeResponse } from "@/services/administration/payments.types";

interface FeeAllocationRowProps {
  fee: FeeResponse;
  paidAmount: number;
  assignedAmount: number;
  schoolYearName?: string;
  currency: "USD" | "VES";
  exchangeRate: number;
  studentName?: string;
  mixedCurrencies?: boolean;
  readOnly?: boolean;
  scholarshipDiscount?: number;
}

export default function FeeAllocationRow({
  fee,
  paidAmount,
  assignedAmount,
  schoolYearName,
  currency,
  exchangeRate,
  studentName,
  mixedCurrencies = false,
  readOnly = false,
  scholarshipDiscount = 0,
}: FeeAllocationRowProps) {
  const feeTotal = Number(fee.value);
  const totalValue = Math.max(0, feeTotal - scholarshipDiscount);
  const pendingBefore = totalValue - paidAmount;
  const pendingAfter = pendingBefore - assignedAmount;
  const progress = totalValue > 0 ? ((paidAmount + assignedAmount) / totalValue) * 100 : 0;

  const isVES = !mixedCurrencies && currency === "VES";
  const symbol = isVES ? "Bs." : "$";

  // Display value: if VES (not mixed), show in VES; otherwise show in USD
  const displayValue = isVES && exchangeRate > 0
    ? assignedAmount * exchangeRate
    : assignedAmount;

  // Max in display currency
  const maxDisplay = isVES && exchangeRate > 0
    ? pendingBefore * exchangeRate
    : pendingBefore;

  // Pending in display currency
  const pendingAfterDisplay = isVES && exchangeRate > 0
    ? pendingAfter * exchangeRate
    : pendingAfter;

  // VES equivalent for mixed mode
  const vesEquivalent = mixedCurrencies && exchangeRate > 0
    ? assignedAmount * exchangeRate
    : null;
  const pendingVesEquivalent = mixedCurrencies && exchangeRate > 0
    ? pendingAfter * exchangeRate
    : null;

  return (
    <div className="border border-(--lightBlueColor)/20 rounded-lg p-3 bg-white flex flex-col gap-1.5">
      {/* Student name */}
      {studentName && (
        <p className="text-xs font-medium text-(--blueColor) truncate" title={studentName}>
          {studentName}
        </p>
      )}

      {/* Fee name + school year */}
      <p className="text-sm font-medium text-gray-800 truncate" title={`${fee.name}${schoolYearName ? ` (${schoolYearName})` : ""}`}>
        {fee.name}
        {schoolYearName && (
          <span className="text-xs text-gray-400 ml-1">({schoolYearName})</span>
        )}
      </p>

      {/* Totals info */}
      <p className="text-xs text-gray-400">
        Total: ${Number(fee.value).toFixed(2)}
        {scholarshipDiscount > 0 && (
          <span className="text-green-600 font-medium"> | Beca: -${scholarshipDiscount.toFixed(2)}</span>
        )}
        {" | Pagado: $"}{paidAmount.toFixed(2)} | Pendiente: ${totalValue.toFixed(2)}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1">
        <div
          className="bg-(--blueColor) h-1 rounded-full transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Abono input */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 whitespace-nowrap">Abono:</label>
        <span className="text-xs font-medium text-gray-500">{symbol}</span>
        <input
          type="number"
          step="0.01"
          min="0"
          max={maxDisplay}
          value={displayValue || ""}
          readOnly={readOnly}
          placeholder="0.00"
          className={`flex-1 min-w-0 px-2 py-1 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-xs ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
        />
      </div>

      {/* VES equivalent (mixed mode) */}
      {vesEquivalent !== null && assignedAmount > 0 && (
        <p className="text-xs text-blue-600">
          Bs. {vesEquivalent.toFixed(2)}
        </p>
      )}

      {/* Remaining */}
      <p className="text-xs text-gray-400">
        Queda: {symbol}{pendingAfterDisplay.toFixed(2)}
        {isVES && exchangeRate > 0 && (
          <span className="text-gray-300 ml-1">(${pendingAfter.toFixed(2)} USD)</span>
        )}
        {pendingVesEquivalent !== null && (
          <span className="text-gray-300 ml-1">(Bs. {pendingVesEquivalent.toFixed(2)})</span>
        )}
      </p>
    </div>
  );
}
