import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import type { Column } from "@/components/table/TableComponent";
import type { PaymentResponse } from "./payments.types";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";
import { dateFormatter } from "@/helpers/formatter";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
      const feeName = studentFee?.fee?.name ?? "—";
      const displayName =
        feeName === "Inscripción" || feeName === "—"
          ? feeName
          : `Mensualidad ${feeName}`;
      return <span className="text-gray-800">{displayName}</span>;
    },
  },
  {
    header: "Monto (Bs)",
    render: (payment) => {
      const amount = Number(payment.totalAmount);
      if (payment.currency === "VES") {
        return <span className="font-bold text-blue-900">Bs. {amount.toFixed(2)}</span>;
      }
      if (payment.exchange?.rate) {
        const converted = amount * Number(payment.exchange.rate);
        return <span className="font-bold text-blue-900">Bs. {converted.toFixed(2)}</span>;
      }
      return <span className="text-gray-400">—</span>;
    },
  },
  {
    header: "Monto ($)",
    render: (payment) => {
      const amount = Number(payment.totalAmount);
      if (payment.currency === "USD") {
        return <span className="font-bold text-green-700">$ {amount.toFixed(2)}</span>;
      }
      if (payment.exchange?.rate) {
        const converted = amount / Number(payment.exchange.rate);
        return <span className="font-bold text-green-700">$ {converted.toFixed(2)}</span>;
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
          Bs. {Number(payment.exchange.rate).toFixed(2)}
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
    header: "Acciones",
    headerClassName: "text-right",
    className: "text-right",
    render: (payment) => (
      <ActionsDropdown paymentId={payment.id} onDelete={() => onDelete(payment.id)} />
    ),
  },
];

export const paymentExpandedRender = (payment: PaymentResponse) => (
  <div className="bg-gray-50/60">
    {/* Header verde unificado tipo tabla PDF */}
    <div className="bg-(--blueColor) text-white grid grid-cols-4 gap-4 px-6 py-2 text-xs font-semibold uppercase tracking-wider">
      <span>Pagado por</span>
      <span>Método de Pago</span>
      <span>Referencia</span>
      <span>Estado</span>
    </div>
    {/* Datos ligeramente más pequeños */}
    <div className="grid grid-cols-4 gap-4 px-6 py-3">
      <div>
        <p className="text-[13px] font-medium text-gray-700">
          {payment.payerName ?? "—"}
        </p>
        <p className="text-xs text-gray-400">
          {payment.payerIdentification ?? ""}
        </p>
      </div>
      <div>
        <p className="text-[13px] text-gray-600">
          {payment.paymentMethod?.type ?? "—"}
        </p>
      </div>
      <div>
        <p className="text-[13px] font-mono text-gray-600">
          {payment.reference ?? "—"}
        </p>
      </div>
      <div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            payment.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {payment.status ? "Pagado" : "Anulado"}
        </span>
      </div>
    </div>
  </div>
);

function ActionsDropdown({ paymentId, onDelete }: { paymentId: number; onDelete: () => void }) {
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
        <DeleteDialog
          preposition="el"
          whatsDeleting={`pago #${paymentId}`}
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
