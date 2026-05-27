import { DollarSign, TrendingUp, TrendingDown, Home, Briefcase, CreditCard, Award, RefreshCw } from "lucide-react";
import type { TasaDolar, AdminTab } from "@/services/administration/administration.types";

interface Props {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    tasaDolar: TasaDolar;
    actualizarTasaDolar: () => void;
}

export default function AdministrationHeader({ activeTab, setActiveTab, tasaDolar, actualizarTasaDolar }: Props) {
    const tabs = [
        { id: "dashboard" as const, label: "Dashboard", icon: Home },
        { id: "nominas" as const, label: "Nóminas", icon: Briefcase },
        { id: "pagos" as const, label: "Pagos", icon: CreditCard },
        { id: "becas" as const, label: "Becas", icon: Award },
    ];

    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition ${activeTab === tab.id
                            ? "bg-white text-blue-900 border-b-2 border-green-500"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                        <DollarSign size={28} className="text-green-400" />
                    </div>
                    <div>
                        <p className="text-blue-100 text-xs uppercase tracking-wide">Tasa del Dólar (BCV)</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">Bs. {tasaDolar.valor.toFixed(2)}</span>
                            <button onClick={actualizarTasaDolar} className="p-1 hover:bg-white/20 rounded-lg transition">
                                <RefreshCw size={14} className="text-blue-200" />
                            </button>
                        </div>
                        <p className="text-blue-200 text-xs">Actualizado: {tasaDolar.fecha}</p>
                    </div>
                    <div className="border-l border-white/20 pl-3">
                        <div className={`flex items-center gap-1 ${tasaDolar.variacion >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tasaDolar.variacion >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="text-sm font-semibold">{Math.abs(tasaDolar.variacion)}%</span>
                        </div>
                        <p className="text-white text-xs">vs ayer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
