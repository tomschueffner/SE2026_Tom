import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { progressColorHex } from '../utils/progressColor';

const BUCKETS = [
  { label: 'Erste Schritte (<50%)',  test: v => v !== null && v < 50,            color: progressColorHex(30)   },
  { label: 'Auf Kurs! (50–79%)',     test: v => v !== null && v >= 50 && v < 80, color: progressColorHex(65)   },
  { label: 'Meisterhaft! (≥80%)',    test: v => v !== null && v >= 80,            color: progressColorHex(90)   },
  { label: 'Kein Fortschritt',       test: v => v === null,                       color: progressColorHex(null) },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, topics } = payload[0].payload;
  return (
    <div className="bg-white border rounded shadow-md px-3 py-2 text-xs max-w-xs">
      <p className="font-semibold text-gray-700 mb-1">{name}</p>
      {topics.map((t, i) => (
        <p key={i} className="text-gray-500">
          <span className="font-medium text-gray-700">{t.subject}</span>: {t.name}
          {t.value !== null ? ` (${t.value}%)` : ''}
        </p>
      ))}
    </div>
  );
}

export default function ProgressPieChart({ subjects }) {
  const [minimized, setMinimized] = useState(false);

  const allTopics = subjects.flatMap(s =>
    (s.topics ?? []).map(t => ({
      name: t.name,
      subject: s.name,
      value: t.progress?.[0]?.value ?? null,
    }))
  );

  const data = BUCKETS.map(b => ({
    name: b.label,
    color: b.color,
    value: allTopics.filter(t => b.test(t.value)).length,
    topics: allTopics.filter(t => b.test(t.value)),
  })).filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white border rounded-lg px-5 py-6 text-center text-sm text-gray-400">
        Noch kein Fortschritt eingetragen.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Fortschrittsverteilung</h2>
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
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={false}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={10}
              payload={BUCKETS
                .map(b => data.find(d => d.name === b.label))
                .filter(Boolean)
                .map(d => ({ value: d.name, type: 'circle', color: d.color }))}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
