import { progColor } from '../utils/progress';

export default function ProgressRing({ value, size = 52, strokeWidth = 5 }) {
  const r = (size - strokeWidth - 1) / 2;
  const circ = 2 * Math.PI * r;
  const dash = value !== null && value !== undefined ? (value / 100) * circ : 0;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--bg3)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={progColor(value)}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}
