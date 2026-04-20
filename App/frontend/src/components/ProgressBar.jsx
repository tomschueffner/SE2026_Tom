import { progColor } from '../utils/progress';

export default function ProgressBar({ value, height = 6 }) {
  return (
    <div className="prog-track" style={{ height }}>
      <div
        className="prog-fill"
        style={{
          width: `${value ?? 0}%`,
          background: progColor(value),
          height,
        }}
      />
    </div>
  );
}
