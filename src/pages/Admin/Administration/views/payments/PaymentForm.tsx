import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check, CreditCard, User } from "lucide-react";
import { paymentSchema, type PaymentFormValues } from "./payments.schema";
import { step1ByName } from "./payments-step1.data";
import { step2ByName } from "./payments-step2.data";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import StudentAutocomplete from "./StudentAutocomplete";
import { usePaymentMethods, useChargeTypes } from "@/hooks/usePayments";
import { useCreatePayment } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";

export default function PaymentForm() {
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: chargeTypes = [] } = useChargeTypes();
  const { mutateAsync: createPayment, isPending } = useCreatePayment();
  const { step, setStep, setScreen } = usePaymentsStore();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: undefined as any,
      chargeTypeId: undefined as any,
      totalAmount: undefined as any,
      currency: "VES",
      paymentMethodId: undefined as any,
      description: "",
      paymentDate: new Date(),
      payerName: "",
      payerIdentification: "",
      payerPhone: "",
      reference: "",
    },
    shouldUnregister: false,
  });

  const { trigger } = form;

  useEffect(() => {
    form.clearErrors();
  }, [step]);

  const f1 = useMemo(() => {
    const field = step1ByName.paymentMethodId;
    if (field.type === "select") {
      field.options = (paymentMethods ?? []).map((pm: any) => ({
        label: pm.type,
        value: pm.id,
      }));
    }
    return step1ByName;
  }, [paymentMethods]);

  const chargeTypeField = useMemo(() => {
    const field = step1ByName.chargeTypeId;
    if (field.type === "select") {
      field.options = (chargeTypes ?? []).map((ct: any) => ({
        label: ct.name,
        value: ct.id,
      }));
    }
    return step1ByName;
  }, [chargeTypes]);

  const f2 = step2ByName;

  const validateStep = async () => {
    let fieldsToValidate: (keyof PaymentFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["studentId", "chargeTypeId", "totalAmount", "currency", "paymentMethodId", "paymentDate"];
    } else if (step === 2) {
      fieldsToValidate = [];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && step < 2) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      await createPayment({
        data: {
          paymentMethodId: data.paymentMethodId,
          totalAmount: data.totalAmount,
          currency: data.currency,
          paymentDate: data.paymentDate,
          status: true,
          studentId: data.studentId,
          chargeTypeId: data.chargeTypeId,
          description: data.description,
          ...(data.reference ? { reference: data.reference } : {}),
          ...(data.payerName ? { payerName: data.payerName } : {}),
          ...(data.payerIdentification ? { payerIdentification: data.payerIdentification } : {}),
          ...(data.payerPhone ? { payerPhone: data.payerPhone } : {}),
        },
      });
      setStep(1);
      setScreen("list");
    } catch (error) {
      console.error("Error al crear pago:", error);
    }
  };

  return (
    <Form {...form}>
      <form>
        <div className="space-y-6">
          {/* ==================== PASO 1: DATOS DEL PAGO ==================== */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 pb-3 border-b border-(--lightBlueColor)/20">
                <div className="p-2 bg-(--lightBlueColor)/15 rounded-lg">
                  <CreditCard size={20} className="text-(--darkBlueColor)" />
                </div>
                <h3 className="text-lg font-semibold text-(--darkBlueColor)">Datos del Pago</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <FieldRenderer
                    field={f1.studentSearch}
                    customFieldRenderer={(f) =>
                      f.name === "studentSearch" ? <StudentAutocomplete /> : null
                    }
                  />
                </div>
                <FieldRenderer field={chargeTypeField.chargeTypeId} />
                <FieldRenderer field={f1.totalAmount} />
                <FieldRenderer field={f1.currency} />
                <FieldRenderer field={f1.paymentDate} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:col-span-2">
                  <FieldRenderer field={f1.paymentMethodId} />
                  <FieldRenderer field={f1.description} />
                </div>
              </div>
            </>
          )}

          {/* ==================== PASO 2: DATOS DEL PAGADOR ==================== */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 pb-3 border-b border-(--lightBlueColor)/20">
                <div className="p-2 bg-(--lightBlueColor)/15 rounded-lg">
                  <User size={20} className="text-(--darkBlueColor)" />
                </div>
                <h3 className="text-lg font-semibold text-(--darkBlueColor)">Datos del Pagador</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRenderer field={f2.payerName} />
                <FieldRenderer field={f2.payerIdentification} />
                <FieldRenderer field={f2.payerPhone} />
                <FieldRenderer field={f2.reference} />
              </div>
            </>
          )}

          {/* ==================== BOTONES DE NAVEGACIÓN ==================== */}
          <div className="flex justify-between pt-6 border-t border-(--lightBlueColor)/20">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="cursor-pointer border-(--lightBlueColor)/50 text-(--darkBlueColor) hover:bg-(--grayColor)"
              >
                <ChevronLeft size={16} className="mr-2" />
                Anterior
              </Button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <Button
                type="button"
                onClick={validateStep}
                className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer"
              >
                Siguiente
                <ChevronRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={isPending}
                className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer disabled:opacity-60"
              >
                {isPending ? "Guardando..." : "Finalizar"}
                {!isPending && <Check size={16} className="ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
