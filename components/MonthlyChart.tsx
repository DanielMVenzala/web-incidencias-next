'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyChartProps {
  data: { name: string; value: number }[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-text-primary font-semibold mb-4">Evolución mensual (últimos 6 meses)</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2C5F7C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2C5F7C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6B6B6B', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B6B6B', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [value, 'Incidencias']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2C5F7C"
              strokeWidth={2}
              fill="url(#colorIncidents)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
