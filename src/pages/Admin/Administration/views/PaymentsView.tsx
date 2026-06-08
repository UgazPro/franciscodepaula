import { Plus, Search, Clock, CheckCircle, AlertCircle, Award, FileDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { usePayments } from "@/hooks/usePayments";
import { useDeletePayment } from "@/queries/usePaymentMutations";
import { usePaymentsStore } from "@/stores/payments.store";
import { paymentColumns } from "@/services/administration/payments.tables";
import type { PaymentResponse } from "@/services/administration/payments.types";
import PaymentForm from "./payments/PaymentForm";
import PaymentsFilter from "./PaymentsFilter";
import { generatePaymentsPdf } from "@/utils/pdfGenerator";

export default function PaymentsView() {
  const { filters } = usePaymentsStore();
  const { data: payments = [], isLoading } = usePayments(filters);
  const { mutateAsync: deletePayment } = useDeletePayment();
  const { screen, searchTerm, setSearchTerm, setScreen, step, setStep } = usePaymentsStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const itemsPerPage = 6;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return payments as PaymentResponse[];
    const term = searchTerm.toLowerCase();
    return (payments as PaymentResponse[]).filter((p) => {
      const studentFee = p.studentFees?.[0];
      const person = studentFee?.student?.person;
      const name =
        `${person?.firstNames ?? ""} ${person?.lastNames ?? ""}`.toLowerCase();
      const ci = (person?.identificationNumber ?? "").toLowerCase();
      const concept = studentFee?.fee?.name?.toLowerCase() ?? "";
      return name.includes(term) || ci.includes(term) || concept.includes(term) || (p.reference?.toLowerCase() ?? "").includes(term);
    });
  }, [payments, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totales = useMemo(() => {
    const allPayments = payments as PaymentResponse[];
    const pagado = allPayments.filter((p) => p.status).reduce((s, p) => s + Number(p.totalAmount), 0);
    const pendiente = 0;
    const vencido = 0;
    return { totalPagado: pagado, totalPendiente: pendiente, totalVencido: vencido };
  }, [payments]);

  const columns = paymentColumns({ onDelete: (id) => deletePayment(id) });

  return (
    <PageTransitionComponent
      primaryChildren={
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
                      await generatePaymentsPdf(filteredData as any);
                    } catch (error) {
                      console.error("Error generating PDF:", error);
                    } finally {
                      setPdfLoading(false);
                    }
                  }}
                  disabled={pdfLoading || filteredData.length === 0}
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Pendiente" value={`Bs. ${totales.totalPendiente.toFixed(2)}`} icon={Clock} color="yellow" />
            <SummaryCard title="Pagado" value={`Bs. ${totales.totalPagado.toFixed(2)}`} icon={CheckCircle} color="green" />
            <SummaryCard title="Vencido" value={`Bs. ${totales.totalVencido.toFixed(2)}`} icon={AlertCircle} color="red" />
            <SummaryCard title="Ahorro por Becas" value="Bs. 0.00" icon={Award} color="blue" />
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
              <TableComponent data={paginatedData} columns={columns} />
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      }

      secondaryChildren={
        <PaymentForm />
      }

      toggle={screen === "form"}
    />
  );
}
