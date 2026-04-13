interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function StatsCard({ title, value, icon, color, bgColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bgColor, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-text-secondary text-sm">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}
