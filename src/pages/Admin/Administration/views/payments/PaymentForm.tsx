import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check, CreditCard, User, ArrowLeft, X, Plus, ChevronDown } from "lucide-react";
import { paymentSchema, type PaymentFormValues } from "./payments.schema";
import { step1ByName } from "./payments-step1.data";
import { step2ByName } from "./payments-step2.data";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import StudentAutocomplete from "./StudentAutocomplete";
import RepresentativeAutocomplete from "./RepresentativeAutocomplete";
import { usePaymentMethods, useFees, useExchangeRate } from "@/hooks/usePayments";
import { useCreatePayment, useCreateExchange, useUpdatePayment } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";
import type { IStudent } from "@/services/users/user.interface";
import type { SelectField } from "@/components/form/formComponent.interface";

interface StudentEntry {
  student: IStudent;
  paidFeeIds: number[];
  selectedFeeIds: number[];
}

const emptyDefaults: PaymentFormValues = {
  exchangeRate: undefined as any,
  currency: "VES",
  totalAmount: undefined as any,
  payerName: "",
  payerIdentification: "",
  payerPhone: "",
  reference: "",
  paymentMethodId: undefined as any,
  description: "",
  paymentDate: new Date(),
};

export default function PaymentForm() {
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: fees = [] } = useFees();
  const { data: latestExchange } = useExchangeRate();
  const { mutateAsync: createPayment, isPending: isCreatePending } = useCreatePayment();
  const { mutateAsync: updatePayment, isPending: isUpdatePending } = useUpdatePayment();
  const { mutateAsync: createExchange } = useCreateExchange();
  const { screen, step, setStep, setScreen, mode, selectedPayment, clearSelected } = usePaymentsStore();

  const [studentEntries, setStudentEntries] = useState<StudentEntry[]>([]);
  const [showSearch, setShowSearch] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const isEditMode = mode === "edit";

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { ...emptyDefaults },
    shouldUnregister: false,
  });

  const { trigger, watch, setValue, reset, control } = form;
  const watchedExchangeRate = watch("exchangeRate");

  // Reset form when opening
  useEffect(() => {
    if (screen !== "form") return;

    setStep(1);

    if (isEditMode && selectedPayment) {
      const sfs = selectedPayment.studentFees ?? [];
      const entries: StudentEntry[] = sfs.map((sf: any) => ({
        student: sf.student,
        paidFeeIds: [],
        selectedFeeIds: [sf.feeId],
      }));

      reset({
        exchangeRate: Number(selectedPayment.exchange?.rate ?? latestExchange?.rate ?? 0),
        currency: selectedPayment.currency,
        totalAmount: Number(selectedPayment.totalAmount) || undefined as any,
        payerName: selectedPayment.payerName ?? "",
        payerIdentification: selectedPayment.payerIdentification ?? "",
        payerPhone: selectedPayment.payerPhone ?? "",
        reference: selectedPayment.reference ?? "",
        paymentMethodId: selectedPayment.paymentMethodId,
        description: selectedPayment.description ?? "",
        paymentDate: new Date(selectedPayment.paymentDate),
      });

      setStudentEntries(entries);
      setShowSearch(false);
      setResetKey(prev => prev + 1);
    } else {
      setStudentEntries([]);
      setShowSearch(true);
      setResetKey(prev => prev + 1);
      reset({ ...emptyDefaults, paymentDate: new Date() });
    }
  }, [screen, isEditMode, selectedPayment, reset, setStep, latestExchange]);

  // Pre-fill exchange rate
  useEffect(() => {
    if (isEditMode) return;
    if (!watchedExchangeRate && latestExchange?.rate) {
      setValue("exchangeRate", Number(latestExchange.rate));
    }
  }, [latestExchange, setValue, isEditMode, watchedExchangeRate]);

  // All fees available in the system
  const allFees = (fees ?? []) as any[];

  // Get available fees for a student (excluding already paid ones)
  const getAvailableFees = useCallback(
    (paidFeeIds: number[]) => {
      return allFees.filter((f: any) => !paidFeeIds.includes(f.id));
    },
    [allFees],
  );

  // Add a student to the list
  const handleAddStudent = useCallback(
    (student: IStudent, paidFeeIds: number[]) => {
      setStudentEntries((prev) => {
        if (prev.some((e) => e.student.id === student.id)) return prev;
        return [
          ...prev,
          { student, paidFeeIds, selectedFeeIds: [] },
        ];
      });
      setShowSearch(false);
    },
    [],
  );

  // Remove a student
  const handleRemoveStudent = useCallback(
    (studentId: number) => {
      setStudentEntries((prev) => prev.filter((e) => e.student.id !== studentId));
    },
    [],
  );

  // Update selected fee IDs for a student
  const handleFeeChange = useCallback(
    (studentId: number, feeIds: number[]) => {
      setStudentEntries((prev) =>
        prev.map((e) =>
          e.student.id === studentId ? { ...e, selectedFeeIds: feeIds } : e,
        ),
      );
    },
    [],
  );

  // Compute expected USD from all selected fees
  const expectedUsd = useMemo(() => {
    let total = 0;
    for (const entry of studentEntries) {
      for (const feeId of entry.selectedFeeIds) {
        const fee = allFees.find((f: any) => f.id === feeId);
        if (fee) total += Number(fee.value);
      }
    }
    return total;
  }, [studentEntries, allFees]);

  const expectedVes = useMemo(
    () => expectedUsd * (watchedExchangeRate ?? 0),
    [expectedUsd, watchedExchangeRate],
  );

  // Build studentFees array from entries
  const buildStudentFees = useCallback(() => {
    const result: { studentId: number; feeId: number }[] = [];
    for (const entry of studentEntries) {
      for (const feeId of entry.selectedFeeIds) {
        result.push({ studentId: entry.student.id, feeId });
      }
    }
    return result;
  }, [studentEntries]);

  // Validation
  const validateStep = async () => {
    if (step === 1) {
      const fieldsValid = await trigger(["exchangeRate", "currency", "totalAmount"]);
      if (!fieldsValid) return;
      if (studentEntries.length === 0) {
        form.setError("root", { message: "Agrega al menos un estudiante" });
        return;
      }
      if (buildStudentFees().length === 0) {
        form.setError("root", { message: "Selecciona al menos un tipo de pago por estudiante" });
        return;
      }
      setStep(2);
    } else {
      const fieldsValid = await trigger([
        "paymentMethodId", "description", "paymentDate",
        "payerName", "payerIdentification", "payerPhone", "reference",
      ]);
      if (!fieldsValid) return;
      await form.handleSubmit(handleSubmit)();
    }
  };

  const handleExchange = async (exchangeRate: number | undefined) => {
    if (!exchangeRate) return;
    if (latestExchange && Number(exchangeRate) === Number(latestExchange.rate)) {
      return latestExchange.id;
    }
    const exchange = await createExchange({ rate: exchangeRate, date: new Date() });
    return exchange.id;
  };

  const handleSubmit = async (data: PaymentFormValues) => {
    try {
      const studentFees = buildStudentFees();
      if (studentFees.length === 0) return;

      const payload: any = {
        paymentMethodId: data.paymentMethodId,
        totalAmount: data.totalAmount,
        currency: data.currency,
        paymentDate: data.paymentDate,
        status: true,
        studentFees,
        description: data.description,
        ...(data.reference ? { reference: data.reference } : {}),
        ...(data.payerName ? { payerName: data.payerName } : {}),
        ...(data.payerIdentification ? { payerIdentification: data.payerIdentification } : {}),
        ...(data.payerPhone ? { payerPhone: data.payerPhone } : {}),
      };

      const exchangeId = await handleExchange(data.exchangeRate);
      if (exchangeId) payload.exchangeId = exchangeId;

      if (isEditMode && selectedPayment) {
        const res = await updatePayment({ id: selectedPayment.id, data: payload });
        if (res?.success === false) return;
      } else {
        const res = await createPayment({ data: payload });
        if (res?.success === false) return;
      }

      setStudentEntries([]);
      setShowSearch(true);
      setResetKey(prev => prev + 1);
      reset({ ...emptyDefaults, paymentDate: new Date() });
      setStep(1);
      clearSelected();
      setScreen("list");
    } catch (error) {
      console.error("Error al guardar pago:", error);
    }
  };

  const handleBack = () => {
    setStudentEntries([]);
    setShowSearch(true);
    setResetKey(prev => prev + 1);
    reset({ ...emptyDefaults, paymentDate: new Date() });
    setStep(1);
    clearSelected();
    setScreen("list");
  };

  const isSaving = isCreatePending || isUpdatePending;
  const rootError = form.formState.errors.root?.message as string | undefined;

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
            {/* ==================== PASO 1: ESTUDIANTES Y MONTO ==================== */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 pb-3 border-b border-(--lightBlueColor)/20">
                  <div className="p-2 bg-(--lightBlueColor)/15 rounded-lg">
                    <CreditCard size={20} className="text-(--darkBlueColor)" />
                  </div>
                  <h3 className="text-lg font-semibold text-(--darkBlueColor)">Estudiantes y Monto</h3>
                </div>

                {/* Row 1: Exchange rate + Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Tasa del Día (Bs./USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-(--lightBlueColor)/5 border border-(--lightBlueColor)/20 rounded-lg p-2.5 flex items-center gap-2 h-10">
                      <span className="text-sm font-medium text-(--darkBlueColor) whitespace-nowrap">1 USD =</span>
                      <input
                        type="number"
                        step="0.01"
                        {...form.register("exchangeRate", { valueAsNumber: true })}
                        className="w-full px-2 h-7 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                        disabled={true}
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">Bs.</span>
                    </div>
                    {form.formState.errors.exchangeRate && (
                      <p className="text-red-500 text-xs mt-1">{String(form.formState.errors.exchangeRate.message ?? "")}</p>
                    )}
                  </div>
                  <FieldRenderer field={step1ByName.currency} />
                </div>

                {/* Row 2: Expected USD + Expected Bs. + Amount to pay */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Total Esperado USD</label>
                    <div className="bg-gray-50 border border-(--lightBlueColor)/20 rounded-lg p-2.5 h-10 flex items-center text-sm font-medium text-gray-600">
                      ${expectedUsd.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Total Esperado Bs.</label>
                    <div className="bg-gray-50 border border-(--lightBlueColor)/20 rounded-lg p-2.5 h-10 flex items-center text-sm font-medium text-gray-600">
                      Bs. {expectedVes.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Monto a Pagar <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="totalAmount"
                      render={({ field }) => (
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          className="w-full px-4 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent"
                        />
                      )}
                    />
                    {form.formState.errors.totalAmount && (
                      <p className="text-red-500 text-xs mt-1">{String(form.formState.errors.totalAmount.message ?? "")}</p>
                    )}
                  </div>
                </div>

                {/* Students section */}
                <div>
                  <label className="block text-sm font-medium text-(--darkBlueColor) mb-2">
                    Estudiantes <span className="text-red-500">*</span>
                  </label>

                  {/* Autocomplete (visible when showSearch is true and capacity remains) */}
                  {showSearch && studentEntries.length < 4 && (
                    <div className="relative mb-3">
                      <StudentAutocomplete
                        key={resetKey}
                        onSelect={handleAddStudent}
                        excludeIds={studentEntries.map((e) => e.student.id)}
                      />
                    </div>
                  )}

                  {/* Horizontal row of student cards */}
                  {studentEntries.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-3">
                      {studentEntries.map((entry) => {
                        const availableFees = getAvailableFees(entry.paidFeeIds);
                        const feeOptions = availableFees.map((f: any) => ({
                          label: `${f.name}${f.schoolYear?.name ? ` (${f.schoolYear.name})` : ""}`,
                          value: f.id,
                        }));
                        const studentUsd = entry.selectedFeeIds.reduce((sum, fid) => {
                          const fee = allFees.find((f: any) => f.id === fid);
                          return sum + (fee ? Number(fee.value) : 0);
                        }, 0);

                        return (
                          <div key={entry.student.id} className="min-w-65 flex-1 border border-(--lightBlueColor)/20 rounded-lg p-4 bg-(--lightBlueColor)/5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                  {entry.student.person.firstNames.charAt(0)}{entry.student.person.lastNames.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800 leading-tight">
                                    {entry.student.person.firstNames} {entry.student.person.lastNames}
                                  </p>
                                  <p className="text-xs text-gray-400">{entry.student.person.identificationNumber}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(entry.student.id)}
                                className="p-1 hover:bg-red-100 rounded-lg transition cursor-pointer text-gray-400 hover:text-red-500 shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            <p className="text-xs text-(--blueColor) font-medium mb-2">
                              Pagará: ${studentUsd.toFixed(2)}
                            </p>

                            <FeeMultiSelect
                              options={feeOptions}
                              selected={entry.selectedFeeIds}
                              onChange={(ids) => handleFeeChange(entry.student.id, ids)}
                            />
                          </div>
                        );
                      })}

                      {/* Add another button inside the flex row */}
                      {!showSearch && studentEntries.length < 4 && (
                        <button
                          type="button"
                          onClick={() => setShowSearch(true)}
                          className="min-w-50 flex-1 border-2 border-dashed border-(--lightBlueColor)/30 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-(--blueColor) hover:border-(--blueColor)/30 transition cursor-pointer bg-transparent"
                        >
                          <Plus size={16} />
                          Agregar otro
                        </button>
                      )}
                    </div>
                  )}

                  {studentEntries.length >= 4 && (
                    <p className="text-xs text-gray-400 mt-1">Máximo 4 estudiantes por pago</p>
                  )}
                </div>

                {/* Summary per student + final */}
                {studentEntries.length > 0 && (
                  <div className="border-t border-(--lightBlueColor)/20 pt-4">
                    <p className="text-sm font-semibold text-(--darkBlueColor) mb-3">Resumen por Estudiante</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      {studentEntries.map((entry) => {
                        const selectedFees = entry.selectedFeeIds
                          .map((fid) => allFees.find((f: any) => f.id === fid))
                          .filter(Boolean) as any[];
                        const subtotalUsd = selectedFees.reduce((s, f) => s + Number(f.value), 0);
                        const subtotalVes = subtotalUsd * (watchedExchangeRate ?? 0);

                        if (selectedFees.length === 0) return null;

                        return (
                          <div key={entry.student.id} className="border-2 border-(--blueColor) rounded-lg p-3 bg-white text-xs">
                            <p className="font-semibold text-gray-800 mb-1.5">
                              {entry.student.person.firstNames} {entry.student.person.lastNames}
                            </p>
                            {selectedFees.map((fee: any) => {
                              const usdVal = Number(fee.value);
                              const vesVal = usdVal * (watchedExchangeRate ?? 0);
                              return (
                                <div key={fee.id} className="flex justify-between text-gray-600 py-0.5">
                                  <span>{fee.name}</span>
                                  <span>${usdVal.toFixed(2)} / Bs. {vesVal.toFixed(2)}</span>
                                </div>
                              );
                            })}
                            <div className="flex justify-between font-medium text-gray-800 border-t border-gray-100 mt-1 pt-1">
                              <span>Subtotal</span>
                              <span>${subtotalUsd.toFixed(2)} / Bs. {subtotalVes.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final totals row */}
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-(--blueColor)/5 border border-(--blueColor)/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total USD</p>
                        <p className="text-lg font-bold text-(--darkBlueColor)">${expectedUsd.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Bs.</p>
                        <p className="text-lg font-bold text-(--darkBlueColor)">Bs. {expectedVes.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {rootError && (
                  <p className="text-red-500 text-sm">{rootError}</p>
                )}
              </>
            )}

            {/* ==================== PASO 2: PAGADOR Y DETALLES ==================== */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2 pb-3 border-b border-(--lightBlueColor)/20">
                  <div className="p-2 bg-(--lightBlueColor)/15 rounded-lg">
                    <User size={20} className="text-(--darkBlueColor)" />
                  </div>
                  <h3 className="text-lg font-semibold text-(--darkBlueColor)">Pagador y Detalles</h3>
                </div>

                {/* Representative autocomplete */}
                <RepresentativeAutocomplete />

                <p className="text-xs text-gray-400 -mt-3">O completa los datos manualmente</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRenderer
                    field={step2ByName.payerName}
                    customFieldRenderer={() => null}
                  />
                  <FieldRenderer
                    field={step2ByName.payerIdentification}
                    customFieldRenderer={() => null}
                  />
                  <FieldRenderer
                    field={step2ByName.payerPhone}
                    customFieldRenderer={() => null}
                  />
                  <FieldRenderer
                    field={step2ByName.reference}
                    customFieldRenderer={() => null}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRenderer
                    field={{
                      ...step2ByName.paymentMethodId,
                      options: (paymentMethods ?? []).map((pm: { type: string; id: number }) => ({
                        label: pm.type,
                        value: pm.id,
                      })),
                    } as SelectField}
                  />
                  <FieldRenderer
                    field={step2ByName.description}
                    customFieldRenderer={() => null}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <FieldRenderer
                    field={step2ByName.paymentDate}
                    customFieldRenderer={() => null}
                  />
                </div>
              </>
            )}

            {/* ==================== BOTONES ==================== */}
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

              <Button
                type="button"
                onClick={step === 2 ? () => form.handleSubmit(handleSubmit)() : validateStep}
                disabled={isSaving}
                className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer disabled:opacity-60"
              >
                {isSaving
                  ? "Guardando..."
                  : step === 1
                    ? "Siguiente"
                    : isEditMode
                      ? "Guardar Cambios"
                      : "Finalizar"}
                {!isSaving && step === 1 && <ChevronRight size={16} className="ml-2" />}
                {!isSaving && step === 2 && <Check size={16} className="ml-2" />}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Simple multi-select component for fee types (local state, no react-hook-form)
interface FeeOption {
  label: string;
  value: string | number;
}

function FeeMultiSelect({
  options, selected, onChange, placeholder = "Seleccione tipos de pago...",
}: {
  options: FeeOption[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculatePosition = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setOpenUp(window.innerHeight - rect.bottom < 260 && rect.top > window.innerHeight - rect.bottom);
  };

  const toggleOption = (value: number) => {
    const exists = selected.includes(value);
    if (exists) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2 relative" ref={ref}>
      <div
        onClick={() => { calculatePosition(); setOpen(!open); }}
        className="flex items-center justify-between border rounded-md px-3 py-2 bg-white cursor-pointer hover:border-gray-400 transition"
      >
        <p className="text-gray-500 text-sm">
          {selected.length === 0 ? placeholder : `${selected.length} seleccionados`}
        </p>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div
          className={`absolute z-50 w-full bg-white border rounded-xl shadow-xl p-2 max-h-64 overflow-auto ${openUp ? "bottom-full mb-2" : "top-full mt-1"}`}
        >
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value as number);
            return (
              <div
                key={String(opt.value)}
                onClick={() => toggleOption(opt.value as number)}
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <span className="text-sm">{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {selected.map((value) => {
          const opt = options.find((o) => o.value === value);
          return (
            <span
              key={value}
              onDoubleClick={() => toggleOption(value)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium cursor-pointer hover:bg-blue-200 transition"
              title="Doble click para quitar"
            >
              {opt?.label ?? value}
            </span>
          );
        })}
      </div>
    </div>
  );
}