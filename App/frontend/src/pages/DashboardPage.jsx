import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { avgProgress, progColor } from '../utils/progress';
import LogoIcon from '../components/LogoIcon';
import ProgressBar from '../components/ProgressBar';
import ProgressRing from '../components/ProgressRing';
import BottomTabBar from '../components/BottomTabBar';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!newName.trim()) return;
    try {
      const { data } = await api.post('/subjects', { name: newName.trim() });
      setSubjects([{ ...data, topics: [] }, ...subjects]);
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Anlegen');
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    await api.delete(`/subjects/${id}`);
    setSubjects(subjects.filter(s => s.id !== id));
  }

  const sortedSubjects = [...subjects].sort((a, b) => {
    const av = avgProgress(a.topics);
    const bv = avgProgress(b.topics);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return bv - av;
  });

  const totalSubjects = subjects.length;
  const totalTopics = subjects.reduce((s, x) => s + x.topics.length, 0);
  const allWithProgress = subjects.flatMap(s => s.topics).filter(t => t.progress?.[0]);
  const overallAvg = allWithProgress.length
    ? Math.round(allWithProgress.reduce((s, t) => s + t.progress[0].value, 0) / allWithProgress.length)
    : null;

  return (
    <div className="app-shell">
      <div className="screen">
        <div className="header">
          <div className="logo-row">
            <LogoIcon size={28} iconSize={14} />
            <span className="header-title">TrackIt</span>
          </div>
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/profil')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        <div className="screen-scroll">
          {/* Stats */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 16, padding: '12px 8px' }}>
            <div className="stat-box">
              <div className="stat-num">{totalSubjects}</div>
              <div className="stat-label">Fächer</div>
            </div>
            <div className="stat-box" style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div className="stat-num">{totalTopics}</div>
              <div className="stat-label">Themen</div>
            </div>
            <div className="stat-box">
              <div className="stat-num" style={{ color: progColor(overallAvg) }}>
                {overallAvg !== null ? `${overallAvg}%` : '–'}
              </div>
              <div className="stat-label">Ø Fortschritt</div>
            </div>
          </div>

          {/* Gesamtfortschritt */}
          {totalSubjects > 0 && (
            <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
              <div className="section-head" style={{ marginBottom: 12 }}>Gesamtfortschritt</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <ProgressRing value={overallAvg} size={56} />
                <div style={{ flex: 1 }}>
                  {sortedSubjects.filter(s => s.topics.length > 0).slice(0, 3).map(s => {
                    const avg = avgProgress(s.topics);
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--fg2)', minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.name}
                        </span>
                        <ProgressBar value={avg} height={5} />
                        <span style={{ fontSize: 11, color: progColor(avg), minWidth: 28, textAlign: 'right', fontWeight: 600 }}>
                          {avg !== null ? `${avg}%` : '–'}
                        </span>
                      </div>
                    );
                  })}
                  {sortedSubjects.filter(s => s.topics.length > 0).length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--fg2)' }}>Noch keine Themen mit Fortschritt.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add subject */}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input className="input" placeholder="Neues Fach…" value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1 }} />
            <button className="btn-primary" type="submit" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>+ Fach</button>
          </form>
          {error && <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>{error}</p>}

          {/* Subject list */}
          <div className="section-head">Fächer ({sortedSubjects.length})</div>
          {sortedSubjects.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fg2)' }}>Noch keine Fächer angelegt.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedSubjects.map(s => {
                const avg = avgProgress(s.topics);
                return (
                  <div key={s.id} className="card card-hover" onClick={() => navigate(`/subjects/${s.id}`, { state: { name: s.name } })}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--fg2)' }}>{s.topics.length} Themen</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: progColor(avg), minWidth: 36, textAlign: 'right' }}>
                          {avg !== null ? `${avg}%` : '–'}
                        </span>
                        <button onClick={e => handleDelete(e, s.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 12, fontFamily: 'var(--font)', padding: 0 }}>
                          Löschen
                        </button>
                      </div>
                    </div>
                    <ProgressBar value={avg} />
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ height: 24 }} />
        </div>

        <BottomTabBar />
      </div>
    </div>
  );
}
