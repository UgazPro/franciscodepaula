import { useMemo } from "react";
import { GraduationCap, Users, TrendingUp, TrendingDown, Wallet, AlertCircle, Award, PieChart, Calendar } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import { usePayrollPeriods } from "@/hooks/usePayroll";
import { useStudentsWithDebts } from "@/hooks/useStudentsWithDebts";
import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";

interface Props {
    becasCount: number;
}

export default function DashboardView({ becasCount }: Props) {
    const { data: employeesData } = useQuery({
        queryKey: ["payroll-employees"],
        queryFn: () => getDataApi("/payroll/employees"),
        staleTime: 1000 * 60 * 5,
    });

    const { data: periodsData } = usePayrollPeriods();
    const { data: studentsData } = useStudentsWithDebts();

    const employees = useMemo(() => (Array.isArray(employeesData?.data) ? employeesData.data : []) as any[], [employeesData]);
    const periods = useMemo(() => (Array.isArray(periodsData?.data) ? periodsData.data : []) as any[], [periodsData]);
    const students = useMemo(() => (Array.isArray(studentsData?.data) ? studentsData.data : []) as any[], [studentsData]);

    const activeStudents = students.length;
    const activeEmployees = employees.length;

    const paidPeriods = periods.filter((p: any) => p.status === true);
    const pendingPeriods = periods.filter((p: any) => p.status === false);
    const totalPaid = paidPeriods.length;
    const totalPending = pendingPeriods.length;

    const docentes = employees.filter((e: any) => e.employeeType === "DOCENTE").length;
    const administrativos = employees.filter((e: any) => e.employeeType === "ADMINISTRATIVO").length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <DashboardCard title="Estudiantes" value={activeStudents} icon={GraduationCap} color="blue" subtitle="Activos" />
                <DashboardCard title="Personal" value={activeEmployees} icon={Users} color="green" subtitle="En servicio" />
                <DashboardCard title="Nóminas Pagadas" value={totalPaid} icon={TrendingUp} color="green" subtitle="Períodos cerrados" />
                <DashboardCard title="Nóminas Pendientes" value={totalPending} icon={TrendingDown} color="red" subtitle="Por generar/pagar" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <DashboardCard title="Becas Activas" value={becasCount} icon={Award} color="blue" subtitle="Estudiantes beneficiados" />
                <DashboardCard title="Docentes" value={docentes} icon={Users} color="green" subtitle="Activos" />
                <DashboardCard title="Administrativos" value={administrativos} icon={Users} color="yellow" subtitle="Activos" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-green-500" />
                        Estado de Nóminas
                    </h3>
                    <div className="space-y-3">
                        {([
                            { label: "Pagadas", value: totalPaid, color: "bg-green-500" },
                            { label: "Pendientes", value: totalPending, color: "bg-yellow-500" },
                        ] as const).map(item => {
                            const total = totalPaid + totalPending;
                            const pct = total > 0 ? (item.value / total) * 100 : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{item.label}</span>
                                        <span className="font-medium">{item.value} períodos</span>
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
                            { label: "Docentes", count: docentes, color: "bg-blue-900" },
                            { label: "Administrativos", count: administrativos, color: "bg-green-500" },
                        ] as const).map(item => {
                            const pct = activeEmployees > 0 ? (item.count / activeEmployees) * 100 : 0;
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
                        Períodos de Nómina Recientes
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {periods.slice(0, 5).map((period: any) => (
                        <div key={period.id} className="px-6 py-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800">
                                    {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][period.month - 1]} {period.year}
                                    {" - "}{period.half === "FIRST_HALF" ? "1ra Quincena" : "2da Quincena"}
                                </p>
                                <p className="text-sm text-gray-500">{period.startDate?.slice(0, 10)} al {period.endDate?.slice(0, 10)}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                period.status ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                                {period.status ? "Generada" : "Pendiente"}
                            </span>
                        </div>
                    ))}
                    {periods.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400">
                            No hay períodos de nómina registrados
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
