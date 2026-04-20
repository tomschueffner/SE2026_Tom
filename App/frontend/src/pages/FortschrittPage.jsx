import { useState, useEffect } from 'react';
import api from '../api/axios';
import { avgProgress, progColor } from '../utils/progress';
import ProgressBar from '../components/ProgressBar';
import ProgressRing from '../components/ProgressRing';
import BottomTabBar from '../components/BottomTabBar';

export default function FortschrittPage() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data));
  }, []);

  const allTopics = subjects
    .flatMap(s => s.topics.map(t => ({ ...t, subjectName: s.name })))
    .filter(t => t.progress?.[0]);

  allTopics.sort((a, b) => b.progress[0].value - a.progress[0].value);

  const overallAvg = allTopics.length
    ? Math.round(
        allTopics.reduce((s, t) => s + t.progress[0].value, 0) / allTopics.length
      )
    : null;

  return (
    <div className="app-shell">
      <div className="screen">
        <div className="header">
          <span className="header-title">Fortschritt</span>
        </div>

        <div className="screen-scroll">
          {/* Gesamtring */}
          <div
            className="card"
            style={{
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px',
            }}
          >
            <ProgressRing value={overallAvg} size={72} />
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: progColor(overallAvg),
                }}
              >
                {overallAvg !== null ? `${overallAvg}%` : '–'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 2 }}>
                Gesamtfortschritt
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 4 }}>
                {allTopics.length} {allTopics.length === 1 ? 'Thema' : 'Themen'}{' '}
                bewertet
              </div>
            </div>
          </div>

          {/* Pro Fach */}
          <div className="section-head">Fortschritt nach Fach</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {subjects.filter(s => s.topics.length > 0).length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--fg2)' }}>
                Noch keine Fächer mit Themen.
              </p>
            )}
            {subjects.map(s => {
              if (s.topics.length === 0) return null;
              const avg = avgProgress(s.topics);
              return (
                <div
                  key={s.id}
                  className="card"
                  style={{ padding: '12px 14px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: progColor(avg),
                      }}
                    >
                      {avg !== null ? `${avg}%` : '–'}
                    </span>
                  </div>
                  <ProgressBar value={avg} />
                  <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 6 }}>
                    {s.topics.length} {s.topics.length === 1 ? 'Thema' : 'Themen'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alle Themen sortiert */}
          {allTopics.length > 0 && (
            <>
              <div className="section-head">Alle Themen (sortiert)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {allTopics.map((t, i) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: 'var(--bg2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--mono)',
                        color: 'var(--fg3)',
                        minWidth: 20,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg2)' }}>
                        {t.subjectName}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 110,
                      }}
                    >
                      <ProgressBar value={t.progress[0].value} height={5} />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: progColor(t.progress[0].value),
                          minWidth: 32,
                          textAlign: 'right',
                        }}
                      >
                        {t.progress[0].value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ height: 24 }} />
        </div>

        <BottomTabBar />
      </div>
    </div>
  );
}
