import type { LucideIcon } from "lucide-react";

interface Props {
    title: string;
    value: string;
    icon: LucideIcon;
    color: "blue" | "green" | "red" | "yellow";
}

const gradientMap: Record<string, string> = {
    blue: "from-blue-900 to-blue-700",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
};

export default function SummaryCard({ title, value, icon: Icon, color }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{title}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`bg-gradient-to-br ${gradientMap[color]} p-2 rounded-lg`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
        </div>
    );
}
