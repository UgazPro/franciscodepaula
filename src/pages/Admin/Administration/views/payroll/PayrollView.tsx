import { useState, useMemo } from "react";
import { Plus, Search, CheckCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { usePayrollPeriods, usePayrollPreview, usePayrollRecords } from "@/hooks/usePayroll";
import { useGeneratePayroll, useMarkAsPaid } from "@/queries/usePayrollMutations";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import SummaryCard from "../../components/SummaryCard";
import PayrollPeriodForm from "./PayrollPeriodForm";
import type { PayrollPeriod, PayrollPreviewItem, PayrollRecord, PayrollHalf } from "@/services/payroll/payroll.types";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function PayrollView() {
  const [screen, setScreen] = useState<"list" | "form">("list");
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterHalf, setFilterHalf] = useState<string>("");

  const { data: periodsData, isLoading: loadingPeriods } = usePayrollPeriods({
    month: filterMonth ? +filterMonth : undefined,
    year: filterYear ? +filterYear : undefined,
    half: filterHalf || undefined,
  });

  const { data: previewData, isLoading: loadingPreview } = usePayrollPreview(selectedPeriodId);

  const { data: recordsData, isLoading: loadingRecords } = usePayrollRecords({
    payrollPeriodId: selectedPeriodId ?? undefined,
  });

  const { mutateAsync: generatePayroll, isPending: generating } = useGeneratePayroll();
  const { mutateAsync: markAsPaid } = useMarkAsPaid();

  const periods = useMemo(() => (periodsData?.data ?? []) as PayrollPeriod[], [periodsData]);
  const previewItems = useMemo(() => (previewData?.data ?? []) as PayrollPreviewItem[], [previewData]);
  const records = useMemo(() => (recordsData?.data ?? []) as PayrollRecord[], [recordsData]);

  const hasRecords = records.length > 0;

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((r) => {
      const name = `${r.employee.user.person.firstNames} ${r.employee.user.person.lastNames}`.toLowerCase();
      const ci = (r.employee.user.person.identificationNumber ?? "").toLowerCase();
      return name.includes(term) || ci.includes(term);
    });
  }, [records, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const totals = useMemo(() => {
    const items = hasRecords ? records : [];
    return {
      totalGross: items.reduce((sum, r) => sum + Number(r.grossSalary ?? 0), 0),
      totalDeductions: items.reduce((sum, r) => sum + Number(r.deductions ?? 0), 0),
      totalBonuses: items.reduce((sum, r) => sum + Number(r.bonuses ?? 0), 0),
      totalNet: items.reduce((sum, r) => sum + Number(r.netSalary ?? 0), 0),
      paidCount: items.filter((r) => r.paymentStatus === "paid").length,
    };
  }, [records, hasRecords]);

  const handleGenerate = async () => {
    if (!selectedPeriodId) return;
    try {
      await generatePayroll({ payrollPeriodId: selectedPeriodId });
    } catch {
      // interceptor handles the toast
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await markAsPaid({ id });
    } catch {
      // interceptor handles the toast
    }
  };

  const formatPeriod = (p: PayrollPeriod) => `${MONTHS[p.month - 1]} ${p.year} - ${p.half === "FIRST_HALF" ? "1ra" : "2da"}`;

  const recordColumns: Column<PayrollRecord>[] = [
    {
      header: "N",
      render: (_row, index) => <span className="text-gray-500">{(currentPage - 1) * itemsPerPage + (index ?? 0) + 1}</span>,
      className: "w-12",
    },
    {
      header: "Empleado",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {row.employee.user.person.firstNames.charAt(0)}{row.employee.user.person.lastNames.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.employee.user.person.firstNames} {row.employee.user.person.lastNames}</p>
            <p className="text-xs text-gray-400">{row.employee.user.person.identificationNumber}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Tipo",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.workedHours !== null ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
        }`}>
          {row.workedHours !== null ? "Docente" : "Administrativo"}
        </span>
      ),
    },
    {
      header: "Horas",
      render: (row) => <span className="text-gray-600">{row.workedHours !== null ? `${row.workedHours} hrs` : "—"}</span>,
    },
    {
      header: "Valor Hora",
      render: (row) => <span className="text-gray-600">{row.hourlyRate !== null ? `$ ${Number(row.hourlyRate).toFixed(2)}` : "—"}</span>,
    },
    {
      header: "Bruto",
      render: (row) => <span className="font-bold text-gray-800">$ {Math.floor(Number(row.grossSalary ?? 0))}</span>,
    },
    {
      header: "Deducciones",
      render: (row) => <span className="text-red-600">$ {Math.floor(Number(row.deductions ?? 0))}</span>,
    },
    {
      header: "Bonificaciones",
      render: (row) => <span className="text-green-600">$ {Math.floor(Number(row.bonuses ?? 0))}</span>,
    },
    {
      header: "Neto",
      render: (row) => <span className="font-bold text-blue-900">$ {Math.floor(Number(row.netSalary ?? 0))}</span>,
    },
    {
      header: "Estado",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {row.paymentStatus === "paid" ? "Pagado" : "Pendiente"}
        </span>
      ),
    },
    {
      header: "Acciones",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.paymentStatus !== "paid" && (
            <button onClick={() => handleMarkPaid(row.id)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer" title="Marcar como pagado">
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const listContent = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar por empleado..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500" />
          </div>
          <div className="flex gap-2">
            <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
              <option value="">Mes</option>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
              <option value="">Año</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <select value={filterHalf} onChange={(e) => { setFilterHalf(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
              <option value="">Quincena</option>
              <option value="FIRST_HALF">1ra</option>
              <option value="SECOND_HALF">2da</option>
            </select>
          </div>
          <button onClick={() => setScreen("form")}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer">
            <Plus size={18} />
            Nuevo Período
          </button>
        </div>
      </div>

      {/* Period selector */}
      {periods.length > 0 && !selectedPeriodId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Seleccionar período para generar nómina:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {periods.map((p) => (
              <button key={p.id} onClick={() => setSelectedPeriodId(p.id)}
                className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                  selectedPeriodId === p.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                <p className="font-medium text-gray-800">{formatPeriod(p)}</p>
                <p className="text-xs text-gray-400 mt-1">{p.startDate?.slice(0, 10)} al {p.endDate?.slice(0, 10)}</p>
                <p className={`text-xs mt-1 font-medium ${p.status ? "text-green-600" : "text-yellow-600"}`}>
                  {p.status ? "Generada" : "Pendiente"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPeriodId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Período seleccionado</p>
              <p className="font-medium text-gray-800">{formatPeriod(periods.find((p) => p.id === selectedPeriodId)!)}</p>
            </div>
            <div className="flex gap-2">
              {!hasRecords && (
                <button onClick={handleGenerate} disabled={generating || previewItems.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 cursor-pointer">
                  {generating ? "Generando..." : "Generar Nómina"}
                </button>
              )}
              <button onClick={() => { setSelectedPeriodId(null); }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer text-sm">
                Cambiar período
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {hasRecords && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Total Bruto" value={`$ ${totals.totalGross.toFixed(2)}`} icon={Eye} color="blue" />
          <SummaryCard title="Deducciones" value={`$ ${totals.totalDeductions.toFixed(2)}`} icon={Eye} color="red" />
          <SummaryCard title="Neto Total" value={`$ ${totals.totalNet.toFixed(2)}`} icon={Eye} color="green" />
          <SummaryCard title="Pagados" value={`${totals.paidCount} / ${records.length}`} icon={CheckCircle} color="green" />
        </div>
      )}

      {/* Preview or Records table */}
      {selectedPeriodId && !hasRecords && !loadingPreview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Previsualización de Nómina</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Valor Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Salario Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewItems.map((item) => (
                  <tr key={item.employeeId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.firstName} {item.lastName}</p>
                          <p className="text-xs text-gray-400">{item.identification}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.type === "Docente" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.workedHours !== null ? `${item.workedHours} hrs` : "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{item.hourlyRate !== null ? `$ ${Number(item.hourlyRate).toFixed(2)}` : "—"}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">$ {Math.floor(Number(item.grossSalary))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasRecords && (
        <>
          <TableComponent data={paginatedRecords} columns={recordColumns} maxHeight={464} />
          <PaginationComponent currentPage={currentPage} totalPages={totalPages} totalItems={filteredRecords.length}
            itemsPerPage={itemsPerPage} onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }} />
        </>
      )}

      {loadingPeriods || loadingPreview || loadingRecords ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          Cargando datos de nómina...
        </div>
      ) : null}
    </div>
  );

  const formContent = (
    <PayrollPeriodForm onBack={() => setScreen("list")} />
  );

  return (
    <PageTransitionComponent primaryChildren={listContent} secondaryChildren={formContent} toggle={screen === "form"} />
  );
}
