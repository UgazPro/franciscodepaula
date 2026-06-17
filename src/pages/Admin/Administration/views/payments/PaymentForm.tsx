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
import { useStudentsWithDebts } from "@/hooks/useStudentsWithDebts";
import { usePaymentMethods, useFees, useExchangeRate } from "@/hooks/usePayments";
import { useCreatePayment, useCreateExchange, useUpdatePayment } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";
import type { IStudent } from "@/services/users/user.interface";

const emptyDefaults: PaymentFormValues = {
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
  exchangeRate: undefined as any,
};

export default function PaymentForm() {
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: fees = [] } = useFees();
  const { data: latestExchange } = useExchangeRate();
  const { data: rawStudentsWithDebts = [] } = useStudentsWithDebts();
  const { mutateAsync: createPayment, isPending: isCreatePending } = useCreatePayment();
  const { mutateAsync: updatePayment, isPending: isUpdatePending } = useUpdatePayment();
  const { mutateAsync: createExchange } = useCreateExchange();
  const { screen, step, setStep, setScreen, mode, selectedPayment, clearSelected } = usePaymentsStore();
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [selectedPaidFeeIds, setSelectedPaidFeeIds] = useState<number[]>([]);
  const [resetKey, setResetKey] = useState(0);

  const isEditMode = mode === "edit";

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { ...emptyDefaults },
    shouldUnregister: false,
  });

  const { trigger, watch, setValue, reset } = form;

  const selectedFeeId = watch("feeId");
  const selectedCurrency = watch("currency");
  const watchedExchangeRate = watch("exchangeRate");

  useEffect(() => {
    form.clearErrors();
  }, [step]);

  // Reset form when opening
  useEffect(() => {
    if (screen !== "form") return;

    const currentMode = usePaymentsStore.getState().mode;
    const payment = usePaymentsStore.getState().selectedPayment;

    setStep(1);

    if (currentMode === "edit" && payment) {
      const studentFee = payment.studentFees?.[0];
      const student = studentFee?.student ?? null;

      reset({
        studentId: student?.id ?? undefined as any,
        feeId: studentFee?.feeId ?? undefined as any,
        totalAmount: Number(payment.totalAmount) || undefined as any,
        currency: payment.currency,
        paymentMethodId: payment.paymentMethodId,
        description: payment.description ?? "",
        paymentDate: new Date(payment.paymentDate),
        payerName: payment.payerName ?? "",
        payerIdentification: payment.payerIdentification ?? "",
        payerPhone: payment.payerPhone ?? "",
        reference: payment.reference ?? "",
        exchangeRate: Number(payment.exchange?.rate ?? latestExchange?.rate ?? 0),
      });

      const studentWithDebts = (rawStudentsWithDebts as any[]).find(
        (s: any) => s.id === student?.id
      );
      const paidFeeIds: number[] = studentWithDebts?.paidFeeIds ?? [];
      const filteredPaidFeeIds = paidFeeIds.filter(
        (fid) => fid !== studentFee?.feeId
      );

      setSelectedStudent(studentWithDebts ?? student ?? null);
      setSelectedPaidFeeIds(filteredPaidFeeIds);
      setResetKey(prev => prev + 1);
    } else {
      setResetKey(prev => prev + 1);
      reset({ ...emptyDefaults, paymentDate: new Date() });
      setSelectedStudent(null);
      setSelectedPaidFeeIds([]);
    }
  }, [screen, reset, setStep, latestExchange]);

  const selectedFee = useMemo(
    () => (fees ?? []).find((f: any) => f.id === selectedFeeId),
    [fees, selectedFeeId],
  );

  // Pre-fill default exchange rate (only for create mode where exchangeRate is not yet set)
  useEffect(() => {
    if (isEditMode) return;
    if (!watchedExchangeRate && latestExchange?.rate) {
      setValue("exchangeRate", Number(latestExchange.rate));
    }
  }, [selectedFeeId, latestExchange, setValue, isEditMode, watchedExchangeRate]);

  // Reset fee when student changes
  useEffect(() => {
    if (isEditMode) return;
    setValue("feeId", undefined as any);
  }, [selectedStudent, isEditMode]);

  // Auto-compute totalAmount
  useEffect(() => {
    if (isEditMode) return;
    if (!selectedFee) return;
    const baseValue = Number(selectedFee.value);
    if (selectedCurrency === "VES") {
      const rate = watchedExchangeRate ?? (latestExchange ? Number(latestExchange.rate) : 0);
      setValue("totalAmount", baseValue * rate);
    } else {
      setValue("totalAmount", baseValue);
    }
  }, [isEditMode, selectedFee, selectedCurrency, watchedExchangeRate, latestExchange, setValue]);

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
      fieldsToValidate = ["studentId", "feeId", "totalAmount", "currency", "paymentMethodId", "paymentDate", "exchangeRate"];
    } else if (step === 2) {
      fieldsToValidate = [];
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

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

  const buildPayload = (data: PaymentFormValues) => {
    const payload: any = {
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
    return payload;
  };

  const handleExchange = async (exchangeRate: number | undefined) => {
    if (!exchangeRate) return;
    if (latestExchange && Number(exchangeRate) === Number(latestExchange.rate)) {
      return latestExchange.id;
    }
    const exchange = await createExchange({ rate: exchangeRate, date: new Date() });
    return exchange.id;
  };

  const onCreateSubmit = async (data: PaymentFormValues) => {
    try {
      const payload = buildPayload(data);
      const exchangeId = await handleExchange(data.exchangeRate);
      if (exchangeId) payload.exchangeId = exchangeId;

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

  const onEditSubmit = async (data: PaymentFormValues) => {
    if (!selectedPayment) return;
    try {
      const payload = buildPayload(data);
      const exchangeId = await handleExchange(data.exchangeRate);
      if (exchangeId) payload.exchangeId = exchangeId;

      const res = await updatePayment({ id: selectedPayment.id, data: payload });
      if (res?.success === false) return;
      setResetKey(prev => prev + 1);
      reset();
      setSelectedStudent(null);
      setSelectedPaidFeeIds([]);
      setStep(1);
      clearSelected();
      setScreen("list");
    } catch (error) {
      console.error("Error al actualizar pago:", error);
    }
  };

  const handleSubmit = isEditMode ? onEditSubmit : onCreateSubmit;

  const handleBack = () => {
    setResetKey(prev => prev + 1);
    reset();
    setSelectedStudent(null);
    setSelectedPaidFeeIds([]);
    setStep(1);
    clearSelected();
    setScreen("list");
  };

  const isSaving = isCreatePending || isUpdatePending;

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
        <h2 className="text-lg font-semibold text-(--darkBlueColor)">
          {isEditMode ? "Editar Pago" : "Registro de Pago"}
        </h2>
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
                    {isEditMode && selectedStudent ? (
                      <>
                        <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                          Estudiante
                        </label>
                        <div className="flex items-center gap-3 bg-(--lightBlueColor)/5 border border-(--lightBlueColor)/20 rounded-lg p-2.5">
                          <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {selectedStudent.person.firstNames.charAt(0)}{selectedStudent.person.lastNames.charAt(0)}
                          </div>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedStudent.person.firstNames} {selectedStudent.person.lastNames}
                            <span className="text-xs text-gray-400 ml-1.5">
                              {selectedStudent.person.identificationNumber}
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <FieldRenderer
                        field={f1.studentSearch}
                        customFieldRenderer={(f) =>
                          f.name === "studentSearch" ? <StudentAutocomplete key={resetKey} onSelect={handleStudentSelect} /> : null
                        }
                      />
                    )}
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
                  onClick={() => form.handleSubmit(handleSubmit)()}
                  disabled={isSaving}
                  className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Finalizar"}
                  {!isSaving && <Check size={16} className="ml-2" />}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
