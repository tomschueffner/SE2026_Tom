import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { progColor } from '../utils/progress';
import ProgressBar from '../components/ProgressBar';
import MiniBarChart from '../components/MiniBarChart';
import BottomTabBar from '../components/BottomTabBar';

export default function SubjectPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [newName, setNewName] = useState('');
  const [active, setActive] = useState(null);
  const [progressVal, setProgressVal] = useState(0);
  const [note, setNote] = useState('');
  const [renameName, setRenameName] = useState('');

  useEffect(() => { loadTopics(); }, []); // eslint-disable-line

  async function loadTopics() {
    const { data } = await api.get(`/topics?subjectId=${id}`);
    setTopics(data);
  }

  async function handleAddTopic(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const { data } = await api.post('/topics', { name: newName.trim(), subjectId: parseInt(id) });
    setTopics([...topics, { ...data, progress: [] }]);
    setNewName('');
  }

  async function handleDeleteTopic(topicId) {
    await api.delete(`/topics/${topicId}`);
    setTopics(topics.filter(t => t.id !== topicId));
  }

  async function handleSaveProgress(e, topicId, currentName) {
    e.preventDefault();
    const trimmed = renameName.trim();
    if (trimmed && trimmed !== currentName) {
      await api.patch(`/topics/${topicId}`, { name: trimmed });
    }
    await api.post('/progress', {
      topicId,
      value: parseInt(progressVal),
      note: note || undefined,
    });
    setActive(null);
    setNote('');
    loadTopics();
  }

  function toggleForm(t) {
    if (active === t.id) {
      setActive(null);
    } else {
      setActive(t.id);
      setProgressVal(t.progress?.[0]?.value ?? 0);
      setRenameName(t.name);
      setNote('');
    }
  }

  return (
    <div className="app-shell">
      <div className="screen">
        <div className="header">
          <button onClick={() => navigate('/dashboard')} className="btn-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Zurück
          </button>
          <span className="header-title">{state?.name || 'Fach'}</span>
          <div style={{ width: 60 }} />
        </div>

        <div className="screen-scroll">
          {/* Bar chart */}
          {topics.length >= 2 && (
            <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
              <div className="section-head" style={{ marginBottom: 10 }}>Themen-Übersicht</div>
              <MiniBarChart topics={topics} />
            </div>
          )}

          {/* Add topic */}
          <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input className="input" placeholder="Neues Thema…" value={newName}
              onChange={e => setNewName(e.target.value)} style={{ flex: 1 }} />
            <button className="btn-primary" type="submit" style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>+ Thema</button>
          </form>

          <div className="section-head">Themen ({topics.length})</div>

          {topics.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--fg2)', fontSize: 13 }}>
              Noch keine Themen angelegt.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topics.map(t => {
              const latest = t.progress?.[0]?.value ?? null;
              const isOpen = active === t.id;
              return (
                <div key={t.id} className={`card ${isOpen ? 'card-active' : ''}`}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{t.name}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button onClick={() => toggleForm(t)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: isOpen ? 'var(--fg2)' : 'var(--accent)', fontSize: 12, fontFamily: 'var(--font)', padding: 0 }}>
                        {isOpen ? 'Abbrechen' : 'Bearbeiten'}
                      </button>
                      <button onClick={() => handleDeleteTopic(t.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 12, fontFamily: 'var(--font)', padding: 0 }}>
                        Löschen
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <ProgressBar value={latest} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: progColor(latest), minWidth: 32, textAlign: 'right' }}>
                      {latest !== null ? `${latest}%` : '–'}
                    </span>
                  </div>

                  {/* Note */}
                  {t.progress?.[0]?.note && !isOpen && (
                    <p style={{ fontSize: 11, color: 'var(--fg2)', fontStyle: 'italic' }}>
                      „{t.progress[0].note}"
                    </p>
                  )}

                  {/* Edit form */}
                  {isOpen && (
                    <form onSubmit={e => handleSaveProgress(e, t.id, t.name)}
                      style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Rename */}
                      <div>
                        <label className="form-label">Thema umbenennen</label>
                        <input className="input" type="text" value={renameName}
                          onChange={e => setRenameName(e.target.value)}
                          style={{ fontSize: 13, padding: '8px 12px' }} />
                      </div>
                      {/* Slider */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="range" min="0" max="100" step="1" value={progressVal}
                          onChange={e => setProgressVal(e.target.value)} style={{ flex: 1 }} />
                        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 8, padding: '4px 10px', minWidth: 52 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{progressVal}%</span>
                        </div>
                      </div>
                      {/* Notiz + Speichern */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input className="input" type="text" placeholder="Notiz (optional)" value={note}
                          onChange={e => setNote(e.target.value)} style={{ flex: 1, fontSize: 13, padding: '8px 12px' }} />
                        <button className="btn-primary" type="submit" style={{ padding: '8px 14px', fontSize: 13 }}>Speichern</button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ height: 24 }} />
        </div>

        <BottomTabBar />
      </div>
    </div>
  );
}
