import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Beca, Estudiante } from "@/services/administration/administration.types";

interface Props {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    paginatedData: Beca[];
    totalPages: number;
    currentPage: number;
    setCurrentPage: (v: number) => void;
    filteredData: Beca[];
    itemsPerPage: number;
    estudiantes: Estudiante[];
    setEditingItem: (v: any) => void;
    setShowModal: (v: boolean) => void;
    setSelectedItem: (v: any) => void;
    setShowDeleteModal: (v: boolean) => void;
}

export default function BecasView({
    searchTerm, setSearchTerm, paginatedData, totalPages,
    currentPage, setCurrentPage, filteredData, itemsPerPage,
    estudiantes, setEditingItem, setShowModal,
    setSelectedItem, setShowDeleteModal,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por estudiante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingItem(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md"
                    >
                        <Plus size={18} />
                        Asignar Beca
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo de Beca</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Porcentaje</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Motivo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Inicio</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aprobada por</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.map((beca: any) => {
                                const estudiante = estudiantes.find(e => e.id === beca.estudianteId);
                                return (
                                    <tr key={beca.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{estudiante?.nombre} {estudiante?.apellido}</p>
                                            <p className="text-xs text-gray-400">{estudiante?.grado} - {estudiante?.seccion}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${beca.tipo === "completa" ? "bg-green-100 text-green-700" :
                                                beca.tipo === "media" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {beca.tipo === "completa" ? "Beca Completa" : beca.tipo === "media" ? "Beca Media" : "Beca Parcial"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-blue-900">{beca.porcentaje}%</td>
                                        <td className="px-6 py-4 text-gray-600">{beca.motivo}</td>
                                        <td className="px-6 py-4 text-gray-600">{beca.fechaInicio}</td>
                                        <td className="px-6 py-4 text-gray-600">{beca.aprobadaPor}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${beca.activa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                                {beca.activa ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setEditingItem(beca); setShowModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => { setSelectedItem(beca); setShowDeleteModal(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
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
