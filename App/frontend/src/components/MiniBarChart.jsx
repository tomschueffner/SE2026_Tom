import { progColor } from '../utils/progress';

// Kompakter Balken-Überblick für Themen eines Fachs (mind. 2 erforderlich)
export default function MiniBarChart({ topics }) {
  if (!topics || topics.length < 2) return null;
  const max = 100;
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        alignItems: 'flex-end',
        height: 48,
      }}
    >
      {topics.map(t => {
        const v = t.progress?.[0]?.value ?? 0;
        return (
          <div
            key={t.id}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <div
              style={{
                width: '100%',
                background: progColor(v),
                borderRadius: '4px 4px 0 0',
                height: `${(v / max) * 38}px`,
                minHeight: 2,
                transition: 'height 0.4s',
              }}
            />
            <div
              style={{
                fontSize: 9,
                color: 'var(--fg2)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'center',
              }}
            >
              {t.name.split(' ')[0]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
