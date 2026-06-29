interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
}

export function StatCard({
  label,
  value,
  icon,
  color = "text-blue-600",
  bgColor = "bg-blue-50",
}: StatCardProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${bgColor}`}>
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
