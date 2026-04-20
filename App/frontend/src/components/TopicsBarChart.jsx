import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { progressColorHex } from '../utils/progressColor';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { fullName, value } = payload[0].payload;
  return (
    <div className="bg-white border rounded shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{fullName}</p>
      <p className="text-gray-500">{value}%</p>
    </div>
  );
}

export default function TopicsBarChart({ topics }) {
  const [minimized, setMinimized] = useState(false);

  const data = [...topics].sort((a, b) => (a.progress?.[0]?.value ?? 0) - (b.progress?.[0]?.value ?? 0)).map(t => ({
    name: t.name.length > 12 ? t.name.slice(0, 11) + '…' : t.name,
    fullName: t.name,
    value: t.progress?.[0]?.value ?? 0,
  }));

  return (
    <div className="bg-white border rounded-lg px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Themen-Fortschritt</h2>
        <button
          onClick={() => setMinimized(m => !m)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title={minimized ? 'Aufklappen' : 'Minimieren'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {minimized
              ? <polyline points="6 9 12 15 18 9" />
              : <polyline points="18 15 12 9 6 15" />}
          </svg>
        </button>
      </div>

      {!minimized && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={progressColorHex(entry.value === 0 ? null : entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
