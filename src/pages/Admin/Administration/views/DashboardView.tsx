import { GraduationCap, Users, TrendingUp, TrendingDown, Wallet, AlertCircle, Award, PieChart, Calendar } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import type { Personal, PagoRepresentante, Beca, Estudiante } from "@/services/administration/administration.types";

interface Props {
    estudiantesActivos: number;
    personalActivo: number;
    ingresosMes: number;
    egresosMes: number;
    balanceMes: number;
    morosidad: number;
    personal: Personal[];
    pagos: PagoRepresentante[];
    estudiantes: Estudiante[];
    becas: Beca[];
    calcularTotalesPagos: () => { totalPagado: number; totalPendiente: number; totalVencido: number; totalConBecas: number };
}

export default function DashboardView({
    estudiantesActivos, personalActivo, ingresosMes, egresosMes, balanceMes, morosidad,
    personal, pagos, estudiantes, becas, calcularTotalesPagos,
}: Props) {
    const personCount = (dept: string) => personal.filter(p => p.departamento === dept).length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard title="Estudiantes" value={estudiantesActivos} icon={GraduationCap} color="blue" subtitle="Activos" />
                <DashboardCard title="Personal" value={personalActivo} icon={Users} color="green" subtitle="En servicio" />
                <DashboardCard title="Ingresos del Mes" value={`Bs. ${ingresosMes.toFixed(2)}`} icon={TrendingUp} color="green" subtitle="+12% vs mes anterior" />
                <DashboardCard title="Egresos del Mes" value={`Bs. ${egresosMes.toFixed(2)}`} icon={TrendingDown} color="red" subtitle="Nóminas + gastos" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <DashboardCard title="Balance del Mes" value={`Bs. ${balanceMes.toFixed(2)}`} icon={Wallet} color={balanceMes >= 0 ? "green" : "red"} subtitle={balanceMes >= 0 ? "Superávit" : "Déficit"} />
                <DashboardCard title="Morosidad" value={`${morosidad.toFixed(1)}%`} icon={AlertCircle} color="yellow" subtitle="Pagos pendientes" />
                <DashboardCard title="Becas Activas" value={becas.filter(b => b.activa).length} icon={Award} color="blue" subtitle="Estudiantes beneficiados" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-green-500" />
                        Estado de Pagos
                    </h3>
                    <div className="space-y-3">
                        {([
                            { label: "Pagado", value: calcularTotalesPagos().totalPagado, color: "bg-green-500" },
                            { label: "Pendiente", value: calcularTotalesPagos().totalPendiente, color: "bg-yellow-500" },
                            { label: "Vencido", value: calcularTotalesPagos().totalVencido, color: "bg-red-500" },
                        ] as const).map(item => {
                            const total = calcularTotalesPagos().totalPagado + calcularTotalesPagos().totalPendiente + calcularTotalesPagos().totalVencido;
                            const pct = total > 0 ? (item.value / total) * 100 : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{item.label}</span>
                                        <span className="font-medium">Bs. {item.value.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-green-500" />
                        Distribución del Personal
                    </h3>
                    <div className="space-y-3">
                        {([
                            { label: "Docentes", count: personCount("docente"), color: "bg-blue-900" },
                            { label: "Administrativos", count: personCount("administrativo"), color: "bg-green-500" },
                            { label: "Mantenimiento", count: personCount("mantenimiento"), color: "bg-yellow-500" },
                        ] as const).map(item => {
                            const pct = personal.length > 0 ? (item.count / personal.length) * 100 : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{item.label}</span>
                                        <span className="font-medium">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <Calendar size={20} className="text-green-500" />
                        Próximos Vencimientos
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {pagos.filter(p => p.estado === "pendiente").slice(0, 5).map(pago => {
                        const estudiante = estudiantes.find(e => e.id === pago.estudianteId);
                        return (
                            <div key={pago.id} className="px-6 py-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">{estudiante?.nombre} {estudiante?.apellido}</p>
                                    <p className="text-sm text-gray-500">{pago.concepto}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-600">Bs. {pago.montoConBeca.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">Vence: {pago.fechaVencimiento}</p>
                                </div>
                            </div>
                        );
                    })}
                    {pagos.filter(p => p.estado === "pendiente").length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400">
                            No hay pagos pendientes próximos a vencer
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
