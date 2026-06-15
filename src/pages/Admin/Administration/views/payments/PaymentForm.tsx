import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check, CreditCard, User, ArrowLeft } from "lucide-react";
import { paymentSchema, type PaymentFormValues } from "./payments.schema";
import { step1ByName } from "./payments-step1.data";
import { step2ByName } from "./payments-step2.data";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import StudentAutocomplete from "./StudentAutocomplete";
import { usePaymentMethods, useFees, useExchangeRate } from "@/hooks/usePayments";
import { useCreatePayment, useCreateExchange } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";
import type { IStudent } from "@/services/users/user.interface";

export default function PaymentForm() {
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: fees = [] } = useFees();
  const { data: latestExchange } = useExchangeRate();
  const { mutateAsync: createPayment, isPending } = useCreatePayment();
  const { mutateAsync: createExchange } = useCreateExchange();
  const { screen, step, setStep, setScreen } = usePaymentsStore();
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [selectedPaidFeeIds, setSelectedPaidFeeIds] = useState<number[]>([]);
  const [resetKey, setResetKey] = useState(0);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: undefined as any,
      feeId: undefined as any,
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

  const { trigger, watch, setValue, reset } = form;

  const selectedFeeId = watch("feeId");
  const selectedCurrency = watch("currency");
  const watchedExchangeRate = watch("exchangeRate");

  useEffect(() => {
    form.clearErrors();
  }, [step]);

  // Reset form when opening for a new payment
  useEffect(() => {
    if (screen === "form") {
      setResetKey(prev => prev + 1);
      reset({
        studentId: undefined as any,
        feeId: undefined as any,
        totalAmount: undefined as any,
        currency: "VES",
        paymentMethodId: undefined as any,
        description: "",
        paymentDate: new Date(),
        payerName: "",
        payerIdentification: "",
        payerPhone: "",
        reference: "",
      });
      setSelectedStudent(null);
      setSelectedPaidFeeIds([]);
      setStep(1);
    }
  }, [screen, reset, setStep]);

  const selectedFee = useMemo(
    () => (fees ?? []).find((f: any) => f.id === selectedFeeId),
    [fees, selectedFeeId],
  );

  // Pre-fill default exchange rate when switching to VES
  useEffect(() => {
    if (selectedCurrency === "VES" && !watchedExchangeRate && latestExchange?.rate) {
      setValue("exchangeRate", Number(latestExchange.rate));
    }
  }, [selectedCurrency, selectedFeeId, latestExchange]);

  // Reset fee when student changes
  useEffect(() => {
    setValue("feeId", undefined as any);
  }, [selectedStudent]);

  // Auto-compute totalAmount whenever inputs change
  useEffect(() => {
    if (!selectedFee) return;
    const baseValue = Number(selectedFee.value);
    if (selectedCurrency === "VES") {
      const rate = watchedExchangeRate ?? (latestExchange ? Number(latestExchange.rate) : 0);
      setValue("totalAmount", baseValue * rate);
    } else {
      setValue("totalAmount", baseValue);
    }
  }, [selectedFee, selectedCurrency, watchedExchangeRate, latestExchange, setValue]);

  const hasActiveEnrollment = useMemo(
    () => selectedStudent?.enrollments?.some((e) => e.status === true) ?? false,
    [selectedStudent],
  );

  const handleStudentSelect = useCallback(
    (student: IStudent, paidFeeIds: number[]) => {
      setSelectedStudent(student);
      setSelectedPaidFeeIds(paidFeeIds);
    },
    [],
  );

  const filteredFees = useMemo(
    () =>
      (fees ?? []).filter((f: any) => {
        if (f.name === "Inscripción") {
          return !hasActiveEnrollment && f.schoolYear?.isActive;
        }
        if (selectedPaidFeeIds.includes(f.id)) {
          return false;
        }
        return true;
      }),
    [fees, hasActiveEnrollment, selectedPaidFeeIds],
  );

  const f1 = useMemo(() => {
    const pmField = step1ByName.paymentMethodId;
    if (pmField.type === "select") {
      pmField.options = (paymentMethods ?? []).map((pm: any) => ({
        label: pm.type,
        value: pm.id,
      }));
    }
    const feeField = step1ByName.feeId;
    if (feeField.type === "select") {
      feeField.options = filteredFees.map((f: any) => ({
        label: `${f.name}${f.schoolYear?.name ? ` (${f.schoolYear.name})` : ""}`,
        value: f.id,
      }));
    }
    return step1ByName;
  }, [paymentMethods, filteredFees]);

  const f2 = step2ByName;

  const validateStep = async () => {
    let fieldsToValidate: (keyof PaymentFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["studentId", "feeId", "totalAmount", "currency", "paymentMethodId", "paymentDate"];
      if (selectedCurrency === "VES") {
        fieldsToValidate.push("exchangeRate");
      }
    } else if (step === 2) {
      fieldsToValidate = [];
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    // Validate: cannot pay Inscripción if already enrolled
    if (step === 1) {
      const fee = (fees ?? []).find((f: any) => f.id === selectedFeeId);
      if (fee?.name === "Inscripción" && hasActiveEnrollment) {
        form.setError("feeId", {
          type: "manual",
          message: "Este estudiante ya está inscrito",
        });
        return;
      }
    }

    if (step < 2) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      let payload: any = {
        paymentMethodId: data.paymentMethodId,
        totalAmount: data.totalAmount,
        currency: data.currency,
        paymentDate: data.paymentDate,
        status: true,
        studentId: data.studentId,
        feeId: data.feeId,
        description: data.description,
        ...(data.reference ? { reference: data.reference } : {}),
        ...(data.payerName ? { payerName: data.payerName } : {}),
        ...(data.payerIdentification ? { payerIdentification: data.payerIdentification } : {}),
        ...(data.payerPhone ? { payerPhone: data.payerPhone } : {}),
      };

      if (data.currency === "VES" && data.exchangeRate) {
        const exchange = await createExchange({
          rate: data.exchangeRate,
          date: new Date(),
        });
        payload.exchangeId = exchange.id;
      }

      const paymentRes = await createPayment({ data: payload });
      if (paymentRes?.success === false) return;
      setResetKey(prev => prev + 1);
      reset();
      setSelectedStudent(null);
      setSelectedPaidFeeIds([]);
      setStep(1);
      setScreen("list");
    } catch (error) {
      console.error("Error al crear pago:", error);
    }
  };

  const handleBack = () => {
    setResetKey(prev => prev + 1);
    reset();
    setSelectedStudent(null);
    setSelectedPaidFeeIds([]);
    setStep(1);
    setScreen("list");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-(--lightBlueColor)/20">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer"
        >
          <ArrowLeft size={20} className="text-(--darkBlueColor)" />
        </button>
        <h2 className="text-lg font-semibold text-(--darkBlueColor)">Registro de Pago</h2>
      </div>

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
                  <div>
                    <FieldRenderer
                      field={f1.studentSearch}
                      customFieldRenderer={(f) =>
                        f.name === "studentSearch" ? <StudentAutocomplete key={resetKey} onSelect={handleStudentSelect} /> : null
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Tasa del Día (Bs./USD)
                    </label>
                    <div className="bg-(--lightBlueColor)/5 border border-(--lightBlueColor)/20 rounded-lg p-2.5 flex items-center gap-2 h-10">
                      <span className="text-sm font-medium text-(--darkBlueColor) whitespace-nowrap">1 USD =</span>
                      <input
                        type="number"
                        step="0.01"
                        {...form.register("exchangeRate", { valueAsNumber: true })}
                        className="w-full px-2 h-7 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">Bs.</span>
                    </div>
                  </div>
                  <FieldRenderer field={f1.feeId} />
                  <FieldRenderer field={f1.totalAmount} disabled />
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
    </div>
  );
}
