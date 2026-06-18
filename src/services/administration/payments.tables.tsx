import { useState } from "react";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import type { Column } from "@/components/table/TableComponent";
import type { PaymentResponse } from "./payments.types";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";
import { dateFormatter, formatCurrency } from "@/helpers/formatter";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Actions {
  onDelete: (id: number) => void;
  onEdit: (payment: PaymentResponse) => void;
}

export const paymentColumns = ({ onDelete, onEdit }: Actions): Column<PaymentResponse>[] => [
  {
    header: "Estudiante",
    render: (payment) => {
      const fees = payment.studentFees ?? [];
      const uniqueStudents = [...new Set(fees.map((sf) => sf.studentId))];
      if (uniqueStudents.length > 1) {
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {uniqueStudents.length}
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {uniqueStudents.length} Estudiantes
              </p>
            </div>
          </div>
        );
      }
      const studentFee = fees[0];
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
    header: "Concepto de Pago",
    render: (payment) => {
      const fees = payment.studentFees ?? [];
      const uniqueFeeNames = [...new Set(fees.map((sf) => sf.fee?.name).filter(Boolean))];
      if (uniqueFeeNames.length > 1) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300">
            {uniqueFeeNames.length} conceptos
          </span>
        );
      }
      const feeName = uniqueFeeNames[0] ?? "—";
      if (feeName === "Inscripción") {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--greenColor)/10 text-(--greenColor) border border-(--greenColor)/30">
            Inscripción
          </span>
        );
      }
      if (feeName === "—") {
        return <span className="text-gray-400">—</span>;
      }
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--blueColor)/10 text-(--blueColor) border border-(--blueColor)/20">
          Mensualidad {feeName}
        </span>
      );
    },
  },
  {
    header: "Monto (Bs.)",
    render: (payment) => {
      const amount = Number(payment.totalAmount);
      if (payment.currency === "VES") {
        return <span className="font-bold text-blue-900">Bs. {formatCurrency(amount)}</span>;
      }
      if (payment.exchange?.rate) {
        const converted = amount * Number(payment.exchange.rate);
        return <span className="font-bold text-blue-900">Bs. {formatCurrency(converted)}</span>;
      }
      return <span className="text-gray-400">—</span>;
    },
  },
  {
    header: "Monto ($)",
    render: (payment) => {
      const amount = Number(payment.totalAmount);
      if (payment.currency === "USD") {
        return <span className="font-bold text-green-700">$ {formatCurrency(amount)}</span>;
      }
      if (payment.exchange?.rate) {
        const converted = amount / Number(payment.exchange.rate);
        return <span className="font-bold text-green-700">$ {formatCurrency(converted)}</span>;
      }
      return <span className="text-gray-400">—</span>;
    },
  },
  {
    header: "Tasa de Cambio",
    render: (payment) => {
      if (!payment.exchange?.rate) {
        return <span className="text-gray-400">—</span>;
      }
      return (
        <span className="text-gray-600">
          Bs. {formatCurrency(Number(payment.exchange.rate))}
        </span>
      );
    },
  },
  {
    header: "Fecha",
    render: (payment) => (
      <span className="text-gray-600">{dateFormatter(new Date(payment.paymentDate))}</span>
    ),
  },
  {
    header: "Método",
    render: (payment) => (
      <span className="text-gray-600">{payment.paymentMethod?.type ?? "—"}</span>
    ),
  },
  {
    header: "Moneda",
    render: (payment) => (
      <span className="text-gray-600">{payment.currency}</span>
    ),
  },
  {
    header: "Referencia",
    render: (payment) => (
      <span className="text-gray-600 font-mono">{payment.reference ?? "—"}</span>
    ),
  },
  {
    header: "Acciones",
    headerClassName: "text-right",
    className: "text-right",
    render: (payment) => (
      <ActionsDropdown payment={payment} onEdit={() => onEdit(payment)} onDelete={() => onDelete(payment.id)} />
    ),
  },
];

export const paymentExpandedRender = (payment: PaymentResponse) => {
  const fees = payment.studentFees ?? [];
  const uniqueStudents = [...new Set(fees.map((sf) => sf.studentId))];
  const uniqueFeeNames = [...new Set(fees.map((sf) => sf.fee?.name).filter(Boolean))];
  const exchangeRate = Number(payment.exchange?.rate ?? 0);

  // Escenario 1: 1 estudiante + 1 concepto
  if (uniqueStudents.length === 1 && uniqueFeeNames.length <= 1) {
    return (
      <div className="bg-gray-50/60 mx-2 mb-2 py-4 px-7">
        <table className="w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-(--blueColor) text-white">
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Nombre</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Cédula</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Teléfono</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-gray-100">
            <tr>
              <td className="px-3 py-1.5">
                <p className="font-medium text-gray-600">{payment.payerName ?? "—"}</p>
              </td>
              <td className="px-3 py-1.5">
                <p className="text-[11px] text-gray-400">{payment.payerIdentification ?? ""}</p>
              </td>
              <td className="px-3 py-1.5">
                <p className="text-[11px] text-gray-400">{payment.payerPhone ?? ""}</p>
              </td>
              <td className="px-3 py-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">Pagado</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Escenario 2: 1 estudiante + varios conceptos
  if (uniqueStudents.length === 1) {
    return (
      <div className="bg-gray-50/60 mx-2 mb-2 py-4 px-7">
        <table className="w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-(--blueColor) text-white">
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Pagado por</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Concepto</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Monto (Bs.)</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Monto ($)</th>
              <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-gray-100">
            {fees.map((sf) => {
              const usdVal = Number(sf.fee?.value ?? 0);
              const vesVal = usdVal * exchangeRate;
              return (
                <tr key={`${sf.studentId}-${sf.feeId}`}>
                  <td className="px-3 py-1.5">
                    <p className="font-medium text-gray-600">{payment.payerName ?? "—"}</p>
                    <p className="text-[11px] text-gray-400">{payment.payerIdentification ?? ""}</p>
                  </td>
                  <td className="px-3 py-1.5 text-gray-600">{sf.fee?.name ?? "—"}</td>
                  <td className="px-3 py-1.5 text-blue-900 font-bold">Bs. {vesVal.toFixed(2)}</td>
                  <td className="px-3 py-1.5 text-green-700 font-bold">$ {usdVal.toFixed(2)}</td>
                  <td className="px-3 py-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">Pagado</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Escenario 3: Varios estudiantes
  return (
    <div className="bg-gray-50/60 mx-2 mb-2 py-4 px-7">
      <table className="w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-(--blueColor) text-white">
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Estudiante</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Concepto</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Monto (Bs.)</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Monto ($)</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Pagado por</th>
            <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-gray-100">
          {fees.map((sf) => {
            const usdVal = Number(sf.fee?.value ?? 0);
            const vesVal = usdVal * exchangeRate;
            return (
              <tr key={`${sf.studentId}-${sf.feeId}`}>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                      {sf.student.person.firstNames.charAt(0)}{sf.student.person.lastNames.charAt(0)}
                    </div>
                    <span className="text-gray-700">{sf.student.person.firstNames} {sf.student.person.lastNames}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 text-gray-600">{sf.fee?.name ?? "—"}</td>
                <td className="px-3 py-1.5 text-blue-900 font-bold">Bs. {vesVal.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-green-700 font-bold">$ {usdVal.toFixed(2)}</td>
                <td className="px-3 py-1.5">
                  <p className="text-gray-600">{payment.payerName ?? "—"}</p>
                  <p className="text-[11px] text-gray-400">{payment.payerIdentification ?? ""}</p>
                </td>
                <td className="px-3 py-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">Pagado</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function ActionsDropdown({ payment, onEdit, onDelete }: { payment: PaymentResponse; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={4} className="w-44 p-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onEdit();
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 rounded-md cursor-pointer"
        >
          <Pencil size={14} />
          Editar pago
        </button>
        <DeleteDialog
          preposition="el"
          whatsDeleting={`pago #${payment.id}`}
          onConfirm={() => {
            setOpen(false);
            onDelete();
          }}
          buttonType="ghost"
          buttonStyles="w-full justify-start gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
          buttonText="Eliminar pago"
        />
      </PopoverContent>
    </Popover>
  );
}
