import { Plus, Search, Award, FileDown, Loader2, DollarSign, TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import SummaryCard from "../components/SummaryCard";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import { usePayments, useExchangeRate } from "@/hooks/usePayments";
import { useDeletePayment } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";
import { paymentColumns, paymentExpandedRender } from "@/services/administration/payments.tables";
import type { PaymentResponse } from "@/services/administration/payments.types";
import PaymentsFilter from "./PaymentsFilter";
import { generatePaymentsPdf } from "@/utils/pdfGenerator";

export default function PaymentsView() {
  const { filters } = usePaymentsStore();
  const { mutateAsync: deletePayment } = useDeletePayment();
  const { searchTerm, setSearchTerm, setScreen, selectPayment, setMode } = usePaymentsStore();

  const { data: latestExchange } = useExchangeRate();
  const exchangeRate = latestExchange?.rate ? Number(latestExchange.rate) : 0;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Paginated query for the table
  const { data: paginatedResult, isLoading } = usePayments({
    ...filters,
    search: searchTerm || undefined,
    page: currentPage,
    take: itemsPerPage,
  });

  // Non-paginated query for totals and PDF export
  const { data: allPaymentsResult } = usePayments({
    ...filters,
    search: searchTerm || undefined,
  });

  const paginatedData = (paginatedResult as any)?.data ?? [];
  const paginationMeta = (paginatedResult as any)?.meta;
  const allPayments = Array.isArray(allPaymentsResult) ? allPaymentsResult : (allPaymentsResult as any)?.data ?? [];

  const totales = useMemo(() => {
    const data = allPayments as PaymentResponse[];

    let totalUSD = 0;
    let totalVES = 0;

    for (const p of data) {
      const amount = Number(p.totalAmount);
      if (p.currency === "USD") {
        totalUSD += amount;
      } else {
        totalVES += amount;
      }
    }

    const totalCombinedUSD = exchangeRate > 0
      ? totalUSD + (totalVES / exchangeRate)
      : totalUSD;

    return { totalUSD, totalVES, totalCombinedUSD, count: data.length };
  }, [allPayments, exchangeRate]);

  const handleEdit = (payment: PaymentResponse) => {
    selectPayment(payment);
    setMode("edit");
    setScreen("form");
  };

  const columns = paymentColumns({
    onDelete: (id) => deletePayment(id),
    onEdit: handleEdit,
  });

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por estudiante o concepto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PaymentsFilter />
            <button
              type="button"
              onClick={async () => {
                setPdfLoading(true);
                try {
                  await generatePaymentsPdf(allPayments as any);
                } catch (error) {
                  console.error("Error generating PDF:", error);
                } finally {
                  setPdfLoading(false);
                }
              }}
              disabled={pdfLoading || allPayments.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-(--blueColor)/30 text-(--blueColor) rounded-xl hover:bg-(--blueColor)/5 hover:border-(--blueColor)/50 transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileDown size={18} />
              )}
              {pdfLoading ? "Generando..." : "PDF"}
            </button>
            <button
              onClick={() => setScreen("form")}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md cursor-pointer"
            >
              <Plus size={18} />
              Registrar Pago
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SummaryCard title="Total en USD" value={`$ ${totales.totalUSD.toFixed(2)}`} icon={DollarSign} color="blue" />
        <SummaryCard title="Total en VES" value={`Bs. ${totales.totalVES.toFixed(2)}`} icon={TrendingUp} color="green" />
        <SummaryCard title="Total Combinado" value={`$ ${totales.totalCombinedUSD.toFixed(2)}`} icon={Award} color="green" />
        <SummaryCard title="Pagos Registrados" value={String(totales.count)} icon={FileDown} color="blue" />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          Cargando pagos...
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          {searchTerm ? "No se encontraron pagos" : "No hay pagos registrados"}
        </div>
      ) : (
        <>
          <TableComponent data={paginatedData} columns={columns} renderExpanded={paymentExpandedRender} getRowId={(p) => p.id} maxHeight={310} />
          {paginationMeta && (
            <PaginationComponent
              currentPage={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              totalItems={paginationMeta.totalCount}
              itemsPerPage={paginationMeta.take}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}
