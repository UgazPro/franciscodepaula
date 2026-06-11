import { DollarSign, TrendingUp, TrendingDown, Home, Briefcase, CreditCard, Award, Users } from "lucide-react";
import type { TasaDolar, AdminTab } from "@/services/administration/administration.types";
import TabsComponent, { type TabItem } from "@/components/tabs/TabsComponent";

interface Props {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    tasaDolar: TasaDolar;
}

export default function AdministrationHeader({ activeTab, setActiveTab, tasaDolar }: Props) {
    const tabItems: TabItem<AdminTab>[] = [
        { value: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
        { value: "estudiantes", label: "Estudiantes", icon: <Users size={18} /> },
        { value: "nominas", label: "Nóminas", icon: <Briefcase size={18} /> },
        { value: "pagos", label: "Pagos", icon: <CreditCard size={18} /> },
        { value: "becas", label: "Becas", icon: <Award size={18} /> },
    ];

    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <TabsComponent tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

            <div className="bg-linear-to-r from-blue-900 to-blue-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                        <DollarSign size={28} className="text-green-400" />
                    </div>
                    <div>
                        <p className="text-blue-100 text-xs uppercase tracking-wide">Tasa del Dólar (BCV)</p>
                            <span className="text-2xl font-bold text-white">Bs. {tasaDolar.valor.toFixed(2)}</span>
                        <p className="text-blue-200 text-xs">Actualizado: {tasaDolar.fecha}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
