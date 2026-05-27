import type { LucideIcon } from "lucide-react";

interface Props {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: "blue" | "green" | "red" | "yellow";
    subtitle?: string;
}

const gradientMap: Record<string, string> = {
    blue: "from-blue-900 to-blue-700",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
};

export default function DashboardCard({ title, value, icon: Icon, color, subtitle }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`bg-gradient-to-br ${gradientMap[color]} p-3 rounded-xl`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
        </div>
    );
}
