import type { Column } from "@/components/table/TableComponent";
import type { PaymentResponse } from "./payments.types";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";
import { dateFormatter } from "@/helpers/formatter";

interface Actions {
  onDelete: (id: number) => void;
}

export const paymentColumns = ({ onDelete }: Actions): Column<PaymentResponse>[] => [
  {
    header: "Estudiante",
    render: (payment) => {
      const studentFee = payment.studentFees?.[0];
      const person = studentFee?.student?.person;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {person ? `${person.firstNames.charAt(0)}${person.lastNames.charAt(0)}` : "?"}
          </div>
          <div>
            <p className="font-medium text-gray-800">
              {person ? `${person.firstNames} ${person.lastNames}` : "—"}
            </p>
            <p className="text-xs text-gray-400">{person?.identificationNumber ?? ""}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: "Tipo de Pago",
    render: (payment) => {
      const studentFee = payment.studentFees?.[0];
      return (
        <span className="text-gray-800">
          {studentFee?.fee?.name ?? "—"}
        </span>
      );
    },
  },
  {
    header: "Monto",
    render: (payment) => (
      <span className="font-bold text-blue-900">
        {payment.currency === "USD" ? "$" : "Bs."} {Number(payment.totalAmount).toFixed(2)}
      </span>
    ),
  },
  {
    header: "Método de Pago",
    render: (payment) => (
      <span className="text-gray-600">{payment.paymentMethod?.type ?? "—"}</span>
    ),
  },
  {
    header: "Fecha",
    render: (payment) => (
                    <span className="text-gray-600">{dateFormatter(new Date(payment.paymentDate))}</span>
    ),
  },
  {
    header: "Referencia",
    render: (payment) => (
      <span className="text-gray-600 font-mono text-sm">{payment.reference ?? "—"}</span>
    ),
  },
  {
    header: "Estado",
    render: (payment) => (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          payment.status
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {payment.status ? "Pagado" : "Anulado"}
      </span>
    ),
  },
  {
    header: "Acciones",
    headerClassName: "text-right",
    className: "text-right",
    render: (payment) => (
      <div className="flex items-center justify-end gap-2">
        <DeleteDialog
          preposition="el"
          whatsDeleting={`pago #${payment.id}`}
          onConfirm={() => onDelete(payment.id)}
        />
      </div>
    ),
  },
];
