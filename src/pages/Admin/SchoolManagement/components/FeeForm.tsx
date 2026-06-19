import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { useExchangeRate } from "@/hooks/usePayments";
import type { FeeResponse } from "@/services/administration/payments.types";
import { feeFormByName } from "./feeForm.data";

const feeFormSchema = z.object({
  name: z.string().min(1, "Seleccione un tipo de pago"),
  valueUSD: z
    .number({ error: "Ingrese el monto en USD" })
    .positive("El monto debe ser mayor a 0"),
  valueVES: z.number().optional(),
  startAt: z.date({ error: "Seleccione una fecha de inicio" }),
  endAt: z.date({ error: "Seleccione una fecha de fin" }),
});

type FeeFormValues = z.infer<typeof feeFormSchema>;

interface FeeFormProps {
  fee: FeeResponse | null;
  schoolYear: { id: number; name: string } | null;
  onSave: (data: { name: string; value: number; startAt: Date; endAt: Date }) => Promise<void>;
  onBack: () => void;
}

export default function FeeForm({ fee, schoolYear, onSave, onBack }: FeeFormProps) {
  const isEditing = !!fee;
  const { data: latestExchange } = useExchangeRate();
  const exchangeRate = latestExchange?.rate ? Number(latestExchange.rate) : null;
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeFormSchema),
    defaultValues: {
      name: "",
      valueUSD: undefined as any,
      valueVES: undefined as any,
      startAt: undefined as any,
      endAt: undefined as any,
    },
  });

  const { watch, setValue } = form;
  const valueUSD = watch("valueUSD");

  useEffect(() => {
    if (fee) {
      setValue("name", fee.name);
      setValue("valueUSD", Number(fee.value));
      setValue("startAt", new Date(fee.startAt));
      setValue("endAt", new Date(fee.endAt));
    }
  }, [fee, setValue]);

  useEffect(() => {
    if (exchangeRate && valueUSD && !isNaN(Number(valueUSD)) && Number(valueUSD) > 0) {
      setValue("valueVES", Number(valueUSD) * exchangeRate);
    } else {
      setValue("valueVES", undefined as any);
    }
  }, [valueUSD, exchangeRate, setValue]);

  const onSubmit = async (data: FeeFormValues) => {
    setIsPending(true);
    try {
      await onSave({
        name: data.name,
        value: data.valueUSD,
        startAt: data.startAt,
        endAt: data.endAt,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--blueColor) hover:text-(--darkBlueColor) transition mb-4 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver a conceptos de pago
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {isEditing ? "Editar Concepto de Pago" : "Crear Concepto de Pago"}
        </h2>
        {schoolYear && (
          <p className="text-sm text-gray-500">
            Año Escolar: <span className="font-semibold text-(--blueColor)">{schoolYear.name}</span>
          </p>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FieldRenderer field={feeFormByName.name} />
            <FieldRenderer field={feeFormByName.valueUSD} />
            <div>
              <FieldRenderer field={feeFormByName.valueVES} disabled />
              {exchangeRate ? (
                <p className="text-[11px] text-gray-400 mt-1">Tasa: 1 USD = Bs. {exchangeRate.toFixed(2)}</p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">Sin tasa disponible</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRenderer field={feeFormByName.startAt} />
            <FieldRenderer field={feeFormByName.endAt} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
