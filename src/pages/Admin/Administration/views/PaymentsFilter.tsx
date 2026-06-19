import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePaymentsStore } from "@/stores/payments.store";
import { useFees, usePaymentMethods } from "@/hooks/usePayments";
import { CalendarFieldComponent } from "@/components/form/renderFormComponents/CalendarFieldComponent";

export default function PaymentsFilter() {
  const [open, setOpen] = useState(false);

  const {
    filters,
    setFilterStartDate,
    setFilterEndDate,
    setFilterExactDate,
    setFilterDateMode,
    setFilterFeeId,
    setFilterPaymentMethodId,
    clearPaymentFilters,
  } = usePaymentsStore();

  const { data: fees = [] } = useFees();
  const { data: paymentMethods = [] } = usePaymentMethods();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.startDate || filters.endDate || filters.exactDate) count++;
    if (filters.feeId !== null) count++;
    if (filters.paymentMethodId !== null) count++;
    if (filters.studentSearch.trim()) count++;
    if (filters.representativeSearch.trim()) count++;
    return count;
  }, [filters]);

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer select-none ${active
      ? "bg-(--blueColor) text-white shadow-sm"
      : "border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor)"
    }`;

  const sectionLabel = (label: string) => (
    <p className="text-xs font-semibold text-(--darkBlueColor)/60 uppercase tracking-wider">{label}</p>
  );

  const uniqueFeeNames = useMemo(() => {
    const seen = new Set<string>();
    return (fees as any[]).filter((f: any) => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });
  }, [fees]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor) transition-all shadow-sm cursor-pointer">
          <SlidersHorizontal size={17} />
          <span className="text-sm font-medium">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-(--blueColor) text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-100 p-3 space-y-3">
        {/* Fecha */}
        <div className="space-y-1.5">
          {sectionLabel("Fecha de Pago")}
          <div className="flex gap-1.5 mb-1">
            <button onClick={() => setFilterDateMode("range")} className={pillClass(filters.dateMode === "range")}>
              Rango
            </button>
            <button onClick={() => setFilterDateMode("exact")} className={pillClass(filters.dateMode === "exact")}>
              Exacta
            </button>
          </div>
          {filters.dateMode === "range" ? (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CalendarFieldComponent
                  value={filters.startDate ? new Date(filters.startDate) : undefined}
                  onChange={(d) => setFilterStartDate(d ? d.toISOString() : null)}
                  placeholder="Desde"
                />
              </div>
              <span className="text-(--lightBlueColor) text-sm">a</span>
              <div className="flex-1">
                <CalendarFieldComponent
                  value={filters.endDate ? new Date(filters.endDate) : undefined}
                  onChange={(d) => setFilterEndDate(d ? d.toISOString() : null)}
                  placeholder="Hasta"
                />
              </div>
            </div>
          ) : (
            <CalendarFieldComponent
              value={filters.exactDate ? new Date(filters.exactDate) : undefined}
              onChange={(d) => setFilterExactDate(d ? d.toISOString() : null)}
              placeholder="Selecciona una fecha"
            />
          )}
        </div>

        <div className="border-t border-(--lightBlueColor)/20" />

        {/* Tipo de Pago */}
        <div className="space-y-1.5">
          {sectionLabel("Tipo de Pago")}
          <div className="flex flex-wrap gap-1.5">
            {uniqueFeeNames.map((f: any) => (
              <button
                key={f.id}
                onClick={() => setFilterFeeId(filters.feeId === f.id ? null : f.id)}
                className={pillClass(filters.feeId === f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-(--lightBlueColor)/20" />

        {/* Método de Pago */}
        <div className="space-y-1.5">
          {sectionLabel("Método de Pago")}
          <div className="flex flex-wrap gap-1.5">
            {(paymentMethods as any[]).map((pm: any) => (
              <button
                key={pm.id}
                onClick={() => setFilterPaymentMethodId(filters.paymentMethodId === pm.id ? null : pm.id)}
                className={pillClass(filters.paymentMethodId === pm.id)}
              >
                {pm.type}
              </button>
            ))}
          </div>
        </div>

        {/* Limpiar */}
        <div className="border-t border-(--lightBlueColor)/20 pt-2">
          <button
            onClick={() => { clearPaymentFilters(); setOpen(false); }}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition cursor-pointer"
          >
            <X size="16" />
            Limpiar filtros
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}