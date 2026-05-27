import { Search, Download, TrendingUp, AlertCircle, CheckCircle, Wallet, Eye, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import SummaryCard from "../components/SummaryCard";
import type { Personal, Nomina } from "@/services/administration/administration.types";

interface Props {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    selectedPeriodo: string;
    setSelectedPeriodo: (v: string) => void;
    calcularTotalesNominas: () => { totalDevengado: number; totalDeducciones: number; totalNeto: number; pagadoTotal: number };
    paginatedData: Nomina[];
    totalPages: number;
    currentPage: number;
    setCurrentPage: (v: number) => void;
    filteredData: Nomina[];
    itemsPerPage: number;
    personal: Personal[];
    handleVerDetalleHoras: (personalId: number, quincena: 1 | 2) => void;
}

export default function NominasView({
    searchTerm, setSearchTerm, selectedPeriodo, setSelectedPeriodo,
    calcularTotalesNominas, paginatedData, totalPages, currentPage,
    setCurrentPage, filteredData, itemsPerPage, personal, handleVerDetalleHoras,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por personal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="month"
                            value={selectedPeriodo}
                            onChange={(e) => setSelectedPeriodo(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                        />
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition">
                            <Download size={18} />
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Total Devengado" value={`Bs. ${calcularTotalesNominas().totalDevengado.toFixed(2)}`} icon={TrendingUp} color="blue" />
                <SummaryCard title="Total Deducciones" value={`Bs. ${calcularTotalesNominas().totalDeducciones.toFixed(2)}`} icon={AlertCircle} color="red" />
                <SummaryCard title="Total Neto" value={`Bs. ${calcularTotalesNominas().totalNeto.toFixed(2)}`} icon={CheckCircle} color="green" />
                <SummaryCard title="Pagado" value={`Bs. ${calcularTotalesNominas().pagadoTotal.toFixed(2)}`} icon={Wallet} color="green" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Personal</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quincena</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horas Trabajadas</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Costo Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Salario Base</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bonificación</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Neto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.map((nom: any) => {
                                const person = personal.find(p => p.id === nom.personalId);
                                return (
                                    <tr key={nom.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {person?.nombre.charAt(0)}{person?.apellido.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{person?.nombre} {person?.apellido}</p>
                                                    <p className="text-xs text-gray-400">{person?.cargo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium">{nom.quincena === 1 ? "1ra Quincena" : "2da Quincena"}</p>
                                                <p className="text-xs text-gray-400">{nom.fechaInicio} al {nom.fechaFin}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleVerDetalleHoras(nom.personalId, nom.quincena)}
                                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                            >
                                                {nom.totalHorasNormales} hrs
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">Bs. {person?.costoHora.toFixed(2)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">Bs. {nom.salarioBase.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-green-600">Bs. {nom.bonoProfesionalidad.toFixed(2)}</td>
                                        <td className="px-6 py-4 font-bold text-blue-900">Bs. {nom.salarioNeto.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                    <Printer size={16} />
                                                </button>
                                                {!nom.pagado && (
                                                    <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
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
