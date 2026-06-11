import { useState, useEffect, useMemo, useRef } from "react";
import {
    X, Receipt, Trash2, Printer
} from "lucide-react";
import { useAdministrationStore } from "@/stores/administration.store";
import { usePaymentsStore } from "@/stores/payments.store";
import {
    personalData, estudiantesData, pagosData, becasData,
    getDiasHabiles, generarRegistrosHoras, getCurrentPeriod, getQuincenaDates
} from "@/services/administration/administration.data";
import type {
    Personal, Nomina, RegistroHoras, PagoRepresentante, Beca, Estudiante, TasaDolar
} from "@/services/administration/administration.types";
import AdministrationHeader from "./components/AdministrationHeader";
import DashboardView from "./views/DashboardView";
import NominasView from "./views/PayrollView";
import PaymentsView from "./views/PaymentsView";
import PaymentForm from "./views/payments/PaymentForm";
import StudentsView from "./views/StudentsView";
import BecasView from "./views/ScholarshipsView";
import { useExchangeRate } from "@/hooks/usePayments";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";

export default function Administracion() {
    const { activeTab, setActiveTab } = useAdministrationStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [showReciboModal, setShowReciboModal] = useState(false);
    const [showHorasDetalleModal, setShowHorasDetalleModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [selectedPersonal, setSelectedPersonal] = useState<Personal | null>(null);
    const [selectedPeriodo, setSelectedPeriodo] = useState(getCurrentPeriod());

    const [personal] = useState<Personal[]>(personalData);
    const [nominas, setNominas] = useState<Nomina[]>([]);
    const [registrosHoras, setRegistrosHoras] = useState<RegistroHoras[]>([]);
    const [pagos] = useState<PagoRepresentante[]>(pagosData);
    const [becas] = useState<Beca[]>(becasData);
    const [estudiantes] = useState<Estudiante[]>(estudiantesData);

    const { data: latestExchange } = useExchangeRate();
    const { screen: paymentsScreen } = usePaymentsStore();
    const isPaymentsFormOpen = paymentsScreen === "form";
    const prevValorRef = useRef(0);

    const tasaDolar = useMemo((): TasaDolar => {
        if (!latestExchange) {
            return { valor: 0, fecha: "-", fuente: "-", variacion: 0 };
        }
        const currentValor = Number(latestExchange.rate);
        const prevValor = prevValorRef.current;

        return {
            valor: currentValor,
            fecha: new Date(latestExchange.date).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" }),
            fuente: "BCV",
            variacion:
                prevValor > 0
                    ? parseFloat((((currentValor - prevValor) / prevValor) * 100).toFixed(1))
                    : 0,
        };
    }, [latestExchange]);

    useEffect(() => {
        if (latestExchange) {
            prevValorRef.current = Number(latestExchange.rate);
        }
    }, [latestExchange]);

    useEffect(() => {
        const generarNominas = () => {
            const nuevasNominas: Nomina[] = [];
            const quincena1Dates = getQuincenaDates(selectedPeriodo, 1);
            const quincena2Dates = getQuincenaDates(selectedPeriodo, 2);
            const diasHabilesQuincena1 = getDiasHabiles(quincena1Dates.fechaInicio, quincena1Dates.fechaFin);
            const diasHabilesQuincena2 = getDiasHabiles(quincena2Dates.fechaInicio, quincena2Dates.fechaFin);
            const totalHorasQuincena1 = diasHabilesQuincena1.length * 8;
            const totalHorasQuincena2 = diasHabilesQuincena2.length * 8;

            personal.filter(p => p.estatus === "activo").forEach(person => {
                const registros = [
                    ...generarRegistrosHoras(person.id, quincena1Dates.fechaInicio, quincena1Dates.fechaFin),
                    ...generarRegistrosHoras(person.id, quincena2Dates.fechaInicio, quincena2Dates.fechaFin)
                ];
                setRegistrosHoras(prev => [...prev, ...registros]);

                const salarioBaseCalculado = (totalHorasQuincena1 + totalHorasQuincena2) * person.costoHora;

                [1, 2].forEach((quincena) => {
                    const horas = quincena === 1 ? totalHorasQuincena1 : totalHorasQuincena2;
                    const dates = quincena === 1 ? quincena1Dates : quincena2Dates;
                    nuevasNominas.push({
                        id: nuevasNominas.length + 1,
                        personalId: person.id,
                        periodo: selectedPeriodo,
                        quincena: quincena as 1 | 2,
                        fechaInicio: dates.fechaInicio,
                        fechaFin: dates.fechaFin,
                        totalHorasNormales: horas,
                        totalHorasExtra: 0,
                        totalHorasBonificadas: 0,
                        salarioBase: salarioBaseCalculado / 2,
                        bonoProfesionalidad: person.bonoProfesionalidad / 2,
                        horasExtraTotal: 0,
                        totalDevengado: (salarioBaseCalculado / 2) + (person.bonoProfesionalidad / 2),
                        deduccionesTotal: (salarioBaseCalculado / 2) * 0.095,
                        salarioNeto: ((salarioBaseCalculado / 2) + (person.bonoProfesionalidad / 2)) - ((salarioBaseCalculado / 2) * 0.095),
                        pagado: false,
                    });
                });
            });

            setNominas(nuevasNominas);
        };

        generarNominas();
    }, [selectedPeriodo, personal]);

    // Reset forms and tabs when navigating from sidebar (component re-mounts)
    useEffect(() => {
        usePaymentsStore.getState().setScreen("list");
        usePaymentsStore.getState().setStep(1);
        useAdministrationStore.getState().setActiveTab("dashboard");
    }, []);

    const filteredData: any[] = useMemo(() => {
        if (activeTab === "nominas") {
            return nominas.filter(n => {
                const person = personal.find(p => p.id === n.personalId);
                return person?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    person?.apellido.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        if (activeTab === "pagos") {
            return pagos.filter(p => {
                const estudiante = estudiantes.find(e => e.id === p.estudianteId);
                return p.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    estudiante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.estado.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        return becas.filter(b => {
            const estudiante = estudiantes.find(e => e.id === b.estudianteId);
            return estudiante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.tipo.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [activeTab, nominas, pagos, becas, personal, estudiantes, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData: any[] = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const calcularTotalesNominas = () => {
        const totalDevengado = nominas.reduce((sum, n) => sum + n.totalDevengado, 0);
        const totalDeducciones = nominas.reduce((sum, n) => sum + n.deduccionesTotal, 0);
        const totalNeto = nominas.reduce((sum, n) => sum + n.salarioNeto, 0);
        const pagadoTotal = nominas.filter(n => n.pagado).reduce((sum, n) => sum + n.salarioNeto, 0);
        return { totalDevengado, totalDeducciones, totalNeto, pagadoTotal };
    };

    const calcularTotalesPagos = () => {
        const totalPendiente = pagos.filter(p => p.estado === "pendiente").reduce((sum, p) => sum + p.montoConBeca, 0);
        const totalPagado = pagos.filter(p => p.estado === "pagado").reduce((sum, p) => sum + p.montoConBeca, 0);
        const totalVencido = pagos.filter(p => p.estado === "vencido").reduce((sum, p) => sum + p.montoConBeca, 0);
        const totalConBecas = pagos.reduce((sum, p) => sum + (p.montoOriginal - p.montoConBeca), 0);
        return { totalPendiente, totalPagado, totalVencido, totalConBecas };
    };

    const handleVerDetalleHoras = (personalId: number, quincena: 1 | 2) => {
        const person = personal.find(p => p.id === personalId);
        const nomina = nominas.find(n => n.personalId === personalId && n.quincena === quincena);
        if (person && nomina) {
            setSelectedPersonal(person);
            setSelectedItem({ ...nomina, personal: person });
            setShowHorasDetalleModal(true);
        }
    };

    const getRegistrosHorasPorRango = (personalId: number, fechaInicio: string, fechaFin: string) => {
        return registrosHoras.filter(r =>
            r.personalId === personalId &&
            r.fecha >= fechaInicio &&
            r.fecha <= fechaFin
        );
    };

    const estudiantesActivos = estudiantes.length;
    const personalActivo = personal.filter(p => p.estatus === "activo").length;
    const ingresosMes = pagos.filter(p => p.estado === "pagado").reduce((sum, p) => sum + p.montoConBeca, 0);
    const egresosMes = nominas.filter(n => n.pagado).reduce((sum, n) => sum + n.salarioNeto, 0);
    const balanceMes = ingresosMes - egresosMes;
    const morosidad = (pagos.filter(p => p.estado === "pendiente" || p.estado === "vencido").reduce((sum, p) => sum + p.montoConBeca, 0) / ingresosMes) * 100;

    return (
        <div className="space-y-6">
            {activeTab === "pagos" ? (
                <PageTransitionComponent
                    primaryChildren={
                        <>
                            <AdministrationHeader
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                tasaDolar={tasaDolar}
                            />
                            <PaymentsView />
                        </>
                    }
                    secondaryChildren={<PaymentForm />}
                    toggle={isPaymentsFormOpen}
                />
            ) : (
                <>
                    <AdministrationHeader
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        tasaDolar={tasaDolar}
                    />

                    {activeTab === "dashboard" && (
                        <DashboardView
                            estudiantesActivos={estudiantesActivos}
                            personalActivo={personalActivo}
                            ingresosMes={ingresosMes}
                            egresosMes={egresosMes}
                            balanceMes={balanceMes}
                            morosidad={morosidad}
                            personal={personal}
                            pagos={pagos}
                            estudiantes={estudiantes}
                            becas={becas}
                            calcularTotalesPagos={calcularTotalesPagos}
                        />
                    )}

                    {activeTab === "nominas" && (
                        <NominasView
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedPeriodo={selectedPeriodo}
                            setSelectedPeriodo={setSelectedPeriodo}
                            calcularTotalesNominas={calcularTotalesNominas}
                            paginatedData={paginatedData}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            filteredData={filteredData}
                            itemsPerPage={itemsPerPage}
                            personal={personal}
                            handleVerDetalleHoras={handleVerDetalleHoras}
                        />
                    )}

                    {activeTab === "estudiantes" && <StudentsView />}

                    {activeTab === "becas" && (
                        <BecasView
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            paginatedData={paginatedData}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            filteredData={filteredData}
                            itemsPerPage={itemsPerPage}
                            estudiantes={estudiantes}
                            setEditingItem={setEditingItem}
                            setShowModal={setShowModal}
                            setSelectedItem={setSelectedItem}
                            setShowDeleteModal={setShowDeleteModal}
                        />
                    )}
                </>
            )}

            {/* ==================== MODALES ==================== */}

            {showHorasDetalleModal && selectedPersonal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-blue-900">Detalle de Horas Trabajadas</h2>
                                <p className="text-sm text-gray-500">{selectedPersonal.nombre} {selectedPersonal.apellido} - {selectedItem.quincena === 1 ? "1ra Quincena" : "2da Quincena"} {selectedItem.periodo}</p>
                            </div>
                            <button onClick={() => setShowHorasDetalleModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Total Horas</p>
                                    <p className="text-2xl font-bold text-blue-900">{selectedItem.totalHorasNormales}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Costo por Hora</p>
                                    <p className="text-2xl font-bold text-green-600">Bs. {selectedPersonal.costoHora.toFixed(2)}</p>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-3">Registro por día</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Fecha</th>
                                            <th className="px-4 py-2 text-left">Día</th>
                                            <th className="px-4 py-2 text-left">Horas</th>
                                            <th className="px-4 py-2 text-left">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getRegistrosHorasPorRango(selectedPersonal.id, selectedItem.fechaInicio, selectedItem.fechaFin).map((registro, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2">{registro.fecha}</td>
                                                <td className="px-4 py-2 capitalize">{registro.diaSemana}</td>
                                                <td className="px-4 py-2">{registro.horasTrabajadas}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${registro.tipo === "normal" ? "bg-gray-100 text-gray-600" :
                                                        registro.tipo === "extra" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                                                        }`}>
                                                        {registro.tipo === "normal" ? "Normal" : registro.tipo === "extra" ? "Extra" : "Bonificada"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500">* Días hábiles considerados: Lunes a Viernes</p>
                                <p className="text-sm text-gray-500">* Jornada laboral estándar: 8 horas diarias</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReciboModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 text-center border-b border-gray-100">
                            <Receipt size={48} className="mx-auto text-green-500 mb-3" />
                            <h3 className="text-xl font-bold text-blue-900">Recibo de Pago</h3>
                            <p className="text-gray-500 text-sm">Factura #{selectedItem.facturaId}</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Estudiante:</span>
                                <span className="font-medium">{estudiantes.find(e => e.id === selectedItem.estudianteId)?.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Concepto:</span>
                                <span>{selectedItem.concepto}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Monto Original:</span>
                                <span>Bs. {selectedItem.montoOriginal.toFixed(2)}</span>
                            </div>
                            {selectedItem.becaAplicada > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Descuento por Beca:</span>
                                    <span>- Bs. {selectedItem.becaAplicada.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-3">
                                <span>Total Pagado:</span>
                                <span className="text-green-600">Bs. {selectedItem.montoConBeca.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 pt-2">
                                <span>Fecha de Pago:</span>
                                <span>{selectedItem.fechaPago || new Date().toISOString().split('T')[0]}</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setShowReciboModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cerrar</button>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                <Printer size={16} className="inline mr-2" /> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && activeTab === "becas" && (
                <Modal title={editingItem ? "Editar Beca" : "Asignar Beca"} onClose={() => setShowModal(false)} onSubmit={() => setShowModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                            <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                <option>Seleccionar estudiante</option>
                                {estudiantes.map(e => <option key={e.id}>{e.nombre} {e.apellido}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Beca</label>
                                <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                    <option>Beca Media (50%)</option>
                                    <option>Beca Completa (100%)</option>
                                    <option>Beca Parcial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje</label>
                                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2"></textarea>
                        </div>
                    </div>
                </Modal>
            )}

            {showPagoModal && (
                <Modal title="Registrar Pago" onClose={() => setShowPagoModal(false)} onSubmit={() => setShowPagoModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                            <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                {estudiantes.map(e => <option key={e.id}>{e.nombre} {e.apellido}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                            <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Mensualidad" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                                    <option>Mensualidad</option>
                                    <option>Inscripción</option>
                                    <option>Actividad</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={28} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar registro?</h3>
                            <p className="text-gray-500">Esta acción no se puede deshacer.</p>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg">Cancelar</button>
                                <button onClick={() => { setShowDeleteModal(false); }} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Modal = ({ title, children, onClose, onSubmit }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-900">{title}</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6">{children}</div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button onClick={onSubmit} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">Guardar</button>
            </div>
        </div>
    </div>
);
