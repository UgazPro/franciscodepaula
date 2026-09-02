import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check, CreditCard, User, ArrowLeft, X, Plus, ChevronDown, Wallet } from "lucide-react";
import { paymentSchema, type PaymentFormValues } from "./payments.schema";
import StudentAutocomplete, { type StudentDebtInfo } from "./StudentAutocomplete";
import RepresentativeAutocomplete from "./RepresentativeAutocomplete";
import FeeAllocationRow from "./FeeAllocationRow";
import PaymentAccountCard from "./PaymentAccountCard";
import { usePaymentMethods, useFees, useExchangeRate } from "@/hooks/usePayments";
import { useCreatePayment, useCreateExchange, useUpdatePayment } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";
import type { IStudent } from "@/services/users/user.interface";
import type { FeeResponse, PaymentEntry } from "@/services/administration/payments.types";

interface FeeAllocation {
  studentId: number;
  feeId: number;
  amount: number;
}

interface StudentEntry {
  student: IStudent;
  paidFeeIds: number[];
  selectedFeeIds: number[];
  debts: StudentDebtInfo[];
}

interface SelectedFeeInfo {
  studentId: number;
  studentName: string;
  fee: FeeResponse;
  paidAmount: number;
  pending: number;
  scholarshipDiscount: number;
}

export default function PaymentForm() {
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: fees = [] } = useFees();
  const { data: exchangeData } = useExchangeRate();
  const { mutateAsync: createPayment, isPending: isCreatePending } = useCreatePayment();
  const { mutateAsync: updatePayment, isPending: isUpdatePending } = useUpdatePayment();
  const { mutateAsync: createExchange } = useCreateExchange();
  const { screen, step, setStep, setScreen, mode, selectedPayment, clearSelected } = usePaymentsStore();

  const [studentEntries, setStudentEntries] = useState<StudentEntry[]>([]);
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([]);
  const [feeAllocations, setFeeAllocations] = useState<FeeAllocation[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [showSearch, setShowSearch] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const isEditMode = mode === "edit";

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      exchangeRate: 0,
      paymentDate: new Date(),
      description: "",
      payerName: "",
      payerIdentification: "",
      payerPhone: "",
    },
    shouldUnregister: false,
  });

  const { trigger, watch, reset, control, setValue } = form;

  const allFees = (fees ?? []) as FeeResponse[];

  // Build list of selected fees with debt info
  const selectedFeesInfo = useMemo<SelectedFeeInfo[]>(() => {
    const result: SelectedFeeInfo[] = [];
    for (const entry of studentEntries) {
      for (const feeId of entry.selectedFeeIds) {
        const fee = allFees.find((f) => f.id === feeId);
        if (!fee) continue;
        const debt = entry.debts.find((d) => d.feeId === feeId);
        const paidAmount = debt ? debt.paidAmount : Number(fee.value);
        result.push({
          studentId: entry.student.id,
          studentName: `${entry.student.person.firstNames} ${entry.student.person.lastNames}`,
          fee,
          paidAmount,
          pending: debt ? debt.pending : 0,
          scholarshipDiscount: debt?.scholarshipDiscount ?? 0,
        });
      }
    }
    return result;
  }, [studentEntries, allFees]);

  // Detect mixed currencies (at least one USD and one VES account)
  const hasMixedCurrencies = useMemo(() => {
    const currencies = paymentEntries
      .filter((e) => e.paymentMethodId > 0)
      .map((e) => paymentMethods.find((pm) => pm.id === e.paymentMethodId)?.paymentType?.currency);
    return currencies.includes("USD") && currencies.includes("VES");
  }, [paymentEntries, paymentMethods]);

  // Get the currency for abono input
  const abonoCurrency = useMemo<"USD" | "VES">(() => {
    if (hasMixedCurrencies) return "USD";
    const validEntry = paymentEntries.find((e) => e.paymentMethodId > 0);
    if (!validEntry) return "USD";
    const method = paymentMethods.find((pm) => pm.id === validEntry.paymentMethodId);
    return method?.paymentType?.currency ?? "USD";
  }, [paymentEntries, paymentMethods, hasMixedCurrencies]);

  // Initialize exchange rate from defaultRate
  useEffect(() => {
    if (screen !== "form") return;
    setStep(1);
    const defaultRate = exchangeData?.defaultRate?.rate ?? exchangeData?.latest?.rate;
    if (defaultRate && !exchangeRate) {
      setExchangeRate(Number(defaultRate));
      setValue("exchangeRate", Number(defaultRate));
    }
  }, [screen, exchangeData, setStep, setValue, exchangeRate]);

  // Reset form when opening
  useEffect(() => {
    if (screen !== "form") return;
    setStep(1);

    if (isEditMode && selectedPayment) {
      const sfp = selectedPayment.studentFeePayments ?? [];
      const entries: StudentEntry[] = [];
      const seen = new Set<number>();
      const allocs: FeeAllocation[] = [];

      for (const sf of sfp) {
        const studentFee = sf.studentFee;
        if (!seen.has(studentFee.studentId)) {
          seen.add(studentFee.studentId);
          entries.push({
            student: studentFee.student as IStudent,
            paidFeeIds: [],
            selectedFeeIds: [],
            debts: [],
          });
        }
        allocs.push({
          studentId: studentFee.studentId,
          feeId: studentFee.feeId,
          amount: Number(sf.amount),
        });
      }

      for (const entry of entries) {
        entry.selectedFeeIds = allocs
          .filter((a) => a.studentId === entry.student.id)
          .map((a) => a.feeId);
      }

      // Build payment entries with reference
      const payEntries: PaymentEntry[] = [
        {
          id: crypto.randomUUID(),
          paymentMethodId: selectedPayment.paymentMethodId,
          amount: Number(selectedPayment.totalAmount),
          reference: selectedPayment.reference ?? "",
          zellePayer: selectedPayment.zellePayer ?? "",
        },
      ];

      reset({
        exchangeRate: Number(selectedPayment.exchange?.rate ?? exchangeData?.defaultRate?.rate ?? 0),
        paymentDate: new Date(selectedPayment.paymentDate),
        description: selectedPayment.description ?? "",
        payerName: selectedPayment.payerName ?? "",
        payerIdentification: selectedPayment.payerIdentification ?? "",
        payerPhone: selectedPayment.payerPhone ?? "",
      });

      setExchangeRate(Number(selectedPayment.exchange?.rate ?? 0));
      setStudentEntries(entries);
      setFeeAllocations(allocs);
      setPaymentEntries(payEntries);
      setShowSearch(false);
      setResetKey((prev) => prev + 1);
    } else {
      setStudentEntries([]);
      setPaymentEntries([]);
      setFeeAllocations([]);
      setShowSearch(true);
      setResetKey((prev) => prev + 1);
      const defaultRate = exchangeData?.defaultRate?.rate ?? exchangeData?.latest?.rate;
      setExchangeRate(Number(defaultRate ?? 0));
      reset({
        exchangeRate: Number(defaultRate ?? 0),
        paymentDate: new Date(),
        description: "",
        payerName: "",
        payerIdentification: "",
        payerPhone: "",
      });
    }
  }, [screen, isEditMode, selectedPayment, reset, setStep, exchangeData]);

  // Add a student
  const handleAddStudent = useCallback(
    (student: IStudent, paidFeeIds: number[], debts: StudentDebtInfo[]) => {
      setStudentEntries((prev) => {
        if (prev.some((e) => e.student.id === student.id)) return prev;
        return [...prev, { student, paidFeeIds, selectedFeeIds: [], debts }];
      });
      setShowSearch(false);
    },
    [],
  );

  // Remove a student
  const handleRemoveStudent = useCallback((studentId: number) => {
    setStudentEntries((prev) => prev.filter((e) => e.student.id !== studentId));
    setFeeAllocations((prev) => prev.filter((a) => a.studentId !== studentId));
  }, []);

  // Update selected fees for a student
  const handleFeeChange = useCallback((studentId: number, feeIds: number[]) => {
    setStudentEntries((prev) =>
      prev.map((e) => {
        if (e.student.id !== studentId) return e;
        // Get all available fees for this student (not fully paid)
        const availableFees = allFees
          .filter((f) => !(e.paidFeeIds ?? []).includes(f.id))
          .sort((a, b) => a.id - b.id);
        // Enforce sequential selection
        const validated: number[] = [];
        for (const fid of feeIds) {
          const idx = availableFees.findIndex((f) => f.id === fid);
          if (idx === -1) continue;
          // Can only select if all previous fees are selected or paid
          const allPrevOk = availableFees.slice(0, idx).every(
            (pf) => validated.includes(pf.id) || (e.paidFeeIds ?? []).includes(pf.id),
          );
          if (allPrevOk && !validated.includes(fid)) {
            validated.push(fid);
          }
        }
        return { ...e, selectedFeeIds: validated };
      }),
    );
    setFeeAllocations((prev) =>
      prev.filter((a) => {
        if (a.studentId !== studentId) return true;
        const entry = studentEntries.find((e) => e.student.id === studentId);
        return entry?.selectedFeeIds.includes(a.feeId) ?? false;
      }),
    );
  }, [allFees, studentEntries]);

  // Payment entries
  const addPaymentEntry = useCallback(() => {
    if (paymentEntries.length >= 3) return;
    setPaymentEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), paymentMethodId: 0, amount: 0, reference: "", zellePayer: "" },
    ]);
  }, [paymentEntries.length]);

  const updatePaymentEntry = useCallback((id: string, data: { paymentMethodId: number; amount: number; reference: string; zellePayer: string }) => {
    setPaymentEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  }, []);

  const removePaymentEntry = useCallback((id: string) => {
    setPaymentEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Totals
  const totalExpected = useMemo(
    () => selectedFeesInfo.reduce((sum, f) => sum + f.pending, 0),
    [selectedFeesInfo],
  );

  const totalAllocated = useMemo(
    () => feeAllocations.reduce((sum, a) => sum + a.amount, 0),
    [feeAllocations],
  );

  const hasSelectedAccount = paymentEntries.some((e) => e.paymentMethodId > 0);

  // Auto-assign abono amounts based on total account amount
  useEffect(() => {
    if (!hasSelectedAccount || selectedFeesInfo.length === 0) return;

    // Calculate total amount across all accounts, converted to USD
    const totalAllAccountsUSD = paymentEntries
      .filter((e) => e.paymentMethodId > 0)
      .reduce((sum, e) => {
        const method = paymentMethods.find((pm) => pm.id === e.paymentMethodId);
        const currency = method?.paymentType?.currency ?? "USD";
        if (currency === "VES" && exchangeRate > 0) {
          return sum + e.amount / exchangeRate;
        }
        return sum + e.amount;
      }, 0);

    if (totalAllAccountsUSD <= 0) {
      setFeeAllocations([]);
      return;
    }

    // Calculate total pending across all selected fees
    const totalPending = selectedFeesInfo.reduce((sum, f) => sum + f.pending, 0);
    if (totalPending <= 0) return;

    // Distribute proportionally, last fee gets the remainder
    const sortedFees = [...selectedFeesInfo].sort((a, b) => a.fee.id - b.fee.id);
    const newAllocations: FeeAllocation[] = [];
    let remaining = totalAllAccountsUSD;

    for (let i = 0; i < sortedFees.length; i++) {
      const info = sortedFees[i];
      if (remaining <= 0) break;
      const isLast = i === sortedFees.length - 1;
      const amount = isLast ? remaining : Math.min(remaining, info.pending);
      newAllocations.push({
        studentId: info.studentId,
        feeId: info.fee.id,
        amount: Math.round(amount * 100) / 100,
      });
      remaining -= amount;
    }

    setFeeAllocations(newAllocations);
  }, [hasSelectedAccount, paymentEntries, selectedFeesInfo, paymentMethods, exchangeRate]);

  // Validation per step
  const validateStep = async () => {
    if (step === 1) {
      if (studentEntries.length === 0) {
        form.setError("root", { message: "Agrega al menos un estudiante" });
        return;
      }
      const hasSelectedFees = studentEntries.some((e) => e.selectedFeeIds.length > 0);
      if (!hasSelectedFees) {
        form.setError("root", { message: "Selecciona al menos un tipo de pago por estudiante" });
        return;
      }
      form.clearErrors("root");
      setStep(2);
    } else if (step === 2) {
      const validEntries = paymentEntries.filter((e) => e.paymentMethodId > 0);
      if (validEntries.length === 0) {
        form.setError("root", { message: "Selecciona al menos una cuenta de pago" });
        return;
      }
      if (feeAllocations.length === 0) {
        form.setError("root", { message: "Asigna al menos un abono a un concepto" });
        return;
      }
      for (const entry of validEntries) {
        if (!entry.reference.trim()) {
          form.setError("root", { message: `Ingresa la referencia para la cuenta seleccionada` });
          return;
        }
        const method = paymentMethods.find((pm) => pm.id === entry.paymentMethodId);
        if (method?.paymentType?.type?.toLowerCase() === "zelle" && !entry.zellePayer.trim()) {
          form.setError("root", { message: "Ingresa el nombre en Zelle" });
          return;
        }
      }
      const fieldsValid = await trigger(["exchangeRate", "paymentDate"]);
      if (!fieldsValid) return;
      form.clearErrors("root");
      setStep(3);
    } else {
      const fieldsValid = await trigger(["payerName", "payerIdentification", "payerPhone"]);
      if (!fieldsValid) return;
      await form.handleSubmit(handleSubmit)();
    }
  };

  const handleExchange = async (rate: number | undefined) => {
    if (!rate) return;
    const defaultRate = exchangeData?.defaultRate?.rate;
    if (defaultRate && Number(rate) === Number(defaultRate)) {
      return exchangeData?.defaultRate?.id;
    }
    if (exchangeData?.latest && Number(rate) === Number(exchangeData.latest.rate)) {
      return exchangeData.latest.id;
    }
    const exchange = await createExchange({ rate, date: new Date(), setByUser: true });
    return exchange.data?.id;
  };

  const handleSubmit = async (data: PaymentFormValues) => {
    try {
      if (feeAllocations.length === 0) return;
      const validEntries = paymentEntries.filter((e) => e.paymentMethodId > 0);
      if (validEntries.length === 0) return;

      const exchangeId = await handleExchange(data.exchangeRate);

      for (const entry of validEntries) {
        const method = paymentMethods.find((pm) => pm.id === entry.paymentMethodId);
        const currency = method?.paymentType?.currency ?? "USD";

        const totalAllAllocations = feeAllocations.reduce((s, a) => s + a.amount, 0);

        // Convert entry amount to USD for proportional distribution
        const entryAmountUSD = currency === "VES" && data.exchangeRate > 0
          ? entry.amount / data.exchangeRate
          : entry.amount;

        // Each payment entry covers a proportional share of each allocation (always in USD)
        const distributedFees = feeAllocations.map((fa) => ({
          studentId: fa.studentId,
          feeId: fa.feeId,
          amount: Math.round(fa.amount * (entryAmountUSD / totalAllAllocations) * 100) / 100,
        }));

        // Adjust rounding on last entry
        if (entry === validEntries[validEntries.length - 1]) {
          const sumDist = distributedFees.reduce((s, f) => s + f.amount, 0);
          const diff = entryAmountUSD - sumDist;
          if (distributedFees.length > 0 && Math.abs(diff) > 0.01) {
            distributedFees[distributedFees.length - 1].amount += diff;
          }
        }

        const payload = {
          paymentMethodId: entry.paymentMethodId,
          totalAmount: entry.amount,
          currency,
          paymentDate: data.paymentDate,
          status: true,
          studentFees: distributedFees,
          description: data.description,
          ...(exchangeId ? { exchangeId } : {}),
          ...(entry.reference ? { reference: entry.reference } : {}),
          ...(entry.zellePayer ? { zellePayer: entry.zellePayer } : {}),
          ...(data.payerName ? { payerName: data.payerName } : {}),
          ...(data.payerIdentification ? { payerIdentification: data.payerIdentification } : {}),
          ...(data.payerPhone ? { payerPhone: data.payerPhone } : {}),
        };

        if (isEditMode && selectedPayment) {
          const res = await updatePayment({ id: selectedPayment.id, data: payload as never });
          if (res?.success === false) return;
        } else {
          const res = await createPayment({ data: payload as never });
          if (res?.success === false) return;
        }
      }

      setStudentEntries([]);
      setPaymentEntries([]);
      setFeeAllocations([]);
      setShowSearch(true);
      setResetKey((prev) => prev + 1);
      setStep(1);
      clearSelected();
      setScreen("list");
    } catch (error) {
      console.error("Error al guardar pago:", error);
    }
  };

  const handleBack = () => {
    setStudentEntries([]);
    setPaymentEntries([]);
    setFeeAllocations([]);
    setShowSearch(true);
    setResetKey((prev) => prev + 1);
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
          <div className="space-y-6 mt-4">
            {/* ==================== PASO 1: ESTUDIANTES Y CARGOS ==================== */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 pb-3 border-b border-(--lightBlueColor)/20">
                  <div className="p-2 bg-(--lightBlueColor)/15 rounded-lg">
                    <CreditCard size={20} className="text-(--darkBlueColor)" />
                  </div>
                  <h3 className="text-lg font-semibold text-(--darkBlueColor)">Estudiantes y Cargos</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--darkBlueColor) mb-2">
                    Estudiantes <span className="text-red-500">*</span>
                  </label>

                  {showSearch && studentEntries.length < 4 && (
                    <div className="relative mb-3">
                      <StudentAutocomplete
                        key={resetKey}
                        onSelect={handleAddStudent}
                        excludeIds={studentEntries.map((e) => e.student.id)}
                      />
                    </div>
                  )}

                  {studentEntries.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-3">
                      {studentEntries.map((entry) => {
                        const availableFees = allFees.filter(
                          (f) => !(entry.paidFeeIds ?? []).includes(f.id),
                        );
                        const feeOptions = availableFees.map((f) => ({
                          label: `${f.name}${f.schoolYear?.name ? ` (${f.schoolYear.name})` : ""}`,
                          value: f.id,
                        }));

                        return (
                          <div
                            key={entry.student.id}
                            className="min-w-65 flex-1 border border-(--lightBlueColor)/20 rounded-lg p-4 bg-(--lightBlueColor)/5"
                          >
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

                            <FeeMultiSelect
                              options={feeOptions}
                              selected={entry.selectedFeeIds}
                              onChange={(ids) => handleFeeChange(entry.student.id, ids)}
                            />
                          </div>
                        );
                      })}

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

                {rootError && <p className="text-red-500 text-sm">{rootError}</p>}
              </>
            )}

            {/* ==================== PASO 2: PAGO (CUENTAS + ABONOS) ==================== */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2 pb-3 border-b border-(--lightBlueColor)/20">
                  <div className="p-2 bg-(--lightBlueColor)/15 rounded-lg">
                    <Wallet size={20} className="text-(--darkBlueColor)" />
                  </div>
                  <h3 className="text-lg font-semibold text-(--darkBlueColor)">Pago</h3>
                </div>

                {/* 1. Payment accounts FIRST */}
                <div>
                  <label className="block text-sm font-medium text-(--darkBlueColor) mb-2">
                    Cuentas de Pago <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paymentEntries.map((entry) => (
                      <div key={entry.id}>
                        <PaymentAccountCard
                          paymentMethodId={entry.paymentMethodId}
                          amount={entry.amount}
                          reference={entry.reference}
                          zellePayer={entry.zellePayer}
                          paymentMethods={paymentMethods as never[]}
                          onUpdate={(data) => updatePaymentEntry(entry.id, data)}
                          onRemove={() => removePaymentEntry(entry.id)}
                        />
                      </div>
                    ))}
                  </div>
                  {paymentEntries.length < 3 && (
                    <button
                      type="button"
                      onClick={addPaymentEntry}
                      className="mt-3 w-full border-2 border-dashed border-(--lightBlueColor)/30 rounded-lg flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-(--blueColor) hover:border-(--blueColor)/30 transition cursor-pointer bg-transparent"
                    >
                      <Plus size={16} />
                      Agregar cuenta
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Puedes agregar hasta 3 cuentas (pueden repetirse)</p>
                </div>

                {/* 2. Fee allocations AFTER accounts */}
                {hasSelectedAccount && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-(--darkBlueColor) mb-2">
                        Abonos por Concepto <span className="text-red-500">*</span>
                        <span className="text-xs font-normal text-gray-400 ml-2">
                          {hasMixedCurrencies
                            ? "(Mixto: USD / VES)"
                            : `(${abonoCurrency === "VES" ? "Bs." : "$"} ${abonoCurrency})`}
                        </span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {selectedFeesInfo.map((info) => {
                          const alloc = feeAllocations.find(
                            (a) => a.studentId === info.studentId && a.feeId === info.fee.id,
                          );
                          return (
                            <FeeAllocationRow
                              key={`${info.studentId}-${info.fee.id}`}
                              fee={info.fee}
                              paidAmount={info.paidAmount}
                              assignedAmount={alloc?.amount ?? 0}
                              schoolYearName={info.fee.schoolYear?.name}
                              currency={abonoCurrency}
                              exchangeRate={exchangeRate}
                              studentName={info.studentName}
                              mixedCurrencies={hasMixedCurrencies}
                              readOnly
                              scholarshipDiscount={info.scholarshipDiscount}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Total */}
                    {totalAllocated > 0 && (
                      <div className="bg-(--blueColor)/5 border border-(--blueColor)/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Abonado</p>
                        <p className="text-lg font-bold text-(--darkBlueColor)">
                          ${totalAllocated.toFixed(2)} USD
                          {exchangeRate > 0 && (
                            <span className="text-sm font-normal text-gray-400 ml-2">
                              Bs. {(totalAllocated * exchangeRate).toFixed(2)}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!hasSelectedAccount && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-400">Selecciona una cuenta de pago para continuar</p>
                  </div>
                )}

                {/* 3. Exchange rate + Date + Description */}
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
                        value={exchangeRate || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setExchangeRate(val);
                          setValue("exchangeRate", val);
                        }}
                        className="w-full px-2 h-7 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">Bs.</span>
                    </div>
                    {exchangeData?.defaultRate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Tasa por defecto: {Number(exchangeData.defaultRate.rate).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Fecha de Pago <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="paymentDate"
                      render={({ field }) => (
                        <input
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">Descripción</label>
                  <input
                    type="text"
                    {...form.register("description")}
                    placeholder="Ej: Pago múltiple"
                    className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                  />
                </div>

                {rootError && <p className="text-red-500 text-sm">{rootError}</p>}
              </>
            )}

            {/* ==================== PASO 3: DATOS DEL PAGADOR ==================== */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-2 pb-3 border-b border-(--lightBlueColor)/20">
                  <div className="p-2 bg-(--lightBlueColor)/15 rounded-lg">
                    <User size={20} className="text-(--darkBlueColor)" />
                  </div>
                  <h3 className="text-lg font-semibold text-(--darkBlueColor)">Datos del Pagador</h3>
                </div>

                <RepresentativeAutocomplete />

                <p className="text-xs text-gray-400 -mt-3 mb-3">O completa los datos manualmente</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Nombre del Pagador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("payerName")}
                      placeholder="Nombre y apellido"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                    {form.formState.errors.payerName && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.payerName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Cédula del Pagador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("payerIdentification")}
                      placeholder="V-12345678"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                    {form.formState.errors.payerIdentification && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.payerIdentification.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                      Teléfono del Pagador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("payerPhone")}
                      placeholder="0412-1234567"
                      className="w-full px-3 h-10 border border-(--lightBlueColor)/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) text-sm"
                    />
                    {form.formState.errors.payerPhone && (
                      <p className="text-red-500 text-xs mt-1">{form.formState.errors.payerPhone.message}</p>
                    )}
                  </div>
                </div>

                {rootError && <p className="text-red-500 text-sm">{rootError}</p>}
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
                onClick={step === 3 ? () => form.handleSubmit(handleSubmit)() : validateStep}
                disabled={isSaving}
                className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer disabled:opacity-60"
              >
                {isSaving
                  ? "Guardando..."
                  : step === 3
                    ? isEditMode
                      ? "Guardar Cambios"
                      : "Finalizar"
                    : "Siguiente"}
                {!isSaving && step < 3 && <ChevronRight size={16} className="ml-2" />}
                {!isSaving && step === 3 && <Check size={16} className="ml-2" />}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ==================== FeeMultiSelect ====================
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between border rounded-md px-3 py-2 bg-white cursor-pointer hover:border-gray-400 transition"
      >
        <p className="text-gray-500 text-sm">
          {selected.length === 0 ? placeholder : `${selected.length} seleccionados`}
        </p>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute z-50 w-full bg-white border rounded-xl shadow-xl p-2 max-h-64 overflow-auto top-full mt-1">
          {options.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No hay conceptos disponibles</p>
          )}
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
