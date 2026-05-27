import { Plus, Search, Clock, CheckCircle, AlertCircle, Award, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import SummaryCard from "../components/SummaryCard";
import type { PagoRepresentante, Estudiante, Beca } from "@/services/administration/administration.types";

interface Props {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    calcularTotalesPagos: () => { totalPendiente: number; totalPagado: number; totalVencido: number; totalConBecas: number };
    paginatedData: PagoRepresentante[];
    totalPages: number;
    currentPage: number;
    setCurrentPage: (v: number) => void;
    filteredData: PagoRepresentante[];
    itemsPerPage: number;
    estudiantes: Estudiante[];
    becas: Beca[];
    getEstadoColor: (estado: string) => string;
    handleRegistrarPago: (pagoId: number) => void;
    setShowPagoModal: (v: boolean) => void;
    setSelectedItem: (v: any) => void;
    setShowReciboModal: (v: boolean) => void;
}

export default function PagosView({
    searchTerm, setSearchTerm, calcularTotalesPagos,
    paginatedData, totalPages, currentPage, setCurrentPage,
    filteredData, itemsPerPage, estudiantes, becas,
    getEstadoColor, handleRegistrarPago, setShowPagoModal,
    setSelectedItem, setShowReciboModal,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por estudiante o concepto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <button
                        onClick={() => { setShowPagoModal(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md"
                    >
                        <Plus size={18} />
                        Registrar Pago
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Pendiente" value={`Bs. ${calcularTotalesPagos().totalPendiente.toFixed(2)}`} icon={Clock} color="yellow" />
                <SummaryCard title="Pagado" value={`Bs. ${calcularTotalesPagos().totalPagado.toFixed(2)}`} icon={CheckCircle} color="green" />
                <SummaryCard title="Vencido" value={`Bs. ${calcularTotalesPagos().totalVencido.toFixed(2)}`} icon={AlertCircle} color="red" />
                <SummaryCard title="Ahorro por Becas" value={`Bs. ${calcularTotalesPagos().totalConBecas.toFixed(2)}`} icon={Award} color="blue" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Concepto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monto Original</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Con Beca</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vencimiento</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.map((pago: any) => {
                                const estudiante = estudiantes.find(e => e.id === pago.estudianteId);
                                const becaAplicada = becas.find(b => b.estudianteId === pago.estudianteId && b.activa);
                                return (
                                    <tr key={pago.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{estudiante?.nombre} {estudiante?.apellido}</p>
                                            <p className="text-xs text-gray-400">{estudiante?.grado} - {estudiante?.seccion}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{pago.concepto}</td>
                                        <td className="px-6 py-4 text-gray-500 line-through">Bs. {pago.montoOriginal.toFixed(2)}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">Bs. {pago.montoConBeca.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-gray-600">{pago.fechaVencimiento}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pago.estado)}`}>
                                                {pago.estado === "pagado" ? "Pagado" : pago.estado === "pendiente" ? "Pendiente" : "Vencido"}
                                            </span>
                                            {becaAplicada && pago.becaAplicada > 0 && (
                                                <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                                                    <Award size={10} /> {becaAplicada.porcentaje}% beca
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setSelectedItem(pago); setShowReciboModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Receipt size={16} />
                                                </button>
                                                {pago.estado === "pendiente" && (
                                                    <button onClick={() => handleRegistrarPago(pago.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} />
            </div>
        </div>
    );
}

function PaginationControls({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: any) {
    return (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
            </p>
            <div className="flex gap-2">
                <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <ChevronLeft size={18} />
                </button>
                <span className="px-4 py-2 bg-blue-900 text-white rounded-lg">{currentPage}</span>
                <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
