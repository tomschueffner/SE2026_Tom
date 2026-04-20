import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { progressColor } from '../utils/progressColor';
import TopicsBarChart from '../components/TopicsBarChart';

export default function SubjectPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [newName, setNewName] = useState('');
  const [active, setActive] = useState(null); // topic-id mit offenem Fortschritts-Formular
  const [progressForm, setProgressForm] = useState({ value: 0, note: '' });
  const [renameName, setRenameName] = useState('');

  useEffect(() => { loadTopics(); }, []);

  async function loadTopics() {
    const { data } = await api.get(`/topics?subjectId=${id}`);
    setTopics(data);
  }

  async function handleAddTopic(e) {
    e.preventDefault();
    const { data } = await api.post('/topics', { name: newName, subjectId: parseInt(id) });
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
      value: parseInt(progressForm.value),
      note: progressForm.note || undefined,
    });
    setActive(null);
    setProgressForm({ value: 0, note: '' });
    loadTopics();
  }

  function toggleForm(topicId, currentName, currentValue) {
    setActive(active === topicId ? null : topicId);
    setProgressForm({ value: currentValue ?? 0, note: '' });
    setRenameName(currentName ?? '');
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:underline">
          ← Zurück
        </button>
        <h1 className="text-xl font-bold">{state?.name || 'Fach'}</h1>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">

        {/* Neues Thema */}
        <form onSubmit={handleAddTopic} className="flex gap-2">
          <input
            type="text" placeholder="Neues Thema (z.B. Kapitel 1)" required
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700">
            Hinzufügen
          </button>
        </form>

        {/* Bar Chart (ab 2 Themen) */}
        {topics.length >= 2 && <TopicsBarChart topics={topics} />}

        {/* Topics-Liste */}
        {topics.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Themen angelegt.</p>
        ) : (
          <ul className="space-y-3">
            {topics.map(t => {
              const latest = t.progress?.[0]?.value ?? null;
              return (
                <li key={t.id} className="bg-white border rounded p-4 space-y-3">

                  {/* Topic-Header */}
                  <div className="flex items-center justify-between">
                    {active === t.id
                      ? <input
                          type="text"
                          value={renameName}
                          onChange={e => setRenameName(e.target.value)}
                          className="font-medium border-b border-blue-400 focus:outline-none bg-transparent"
                        />
                      : <span className="font-medium">{t.name}</span>
                    }
                    <div className="flex gap-3 text-sm">
                      <button onClick={() => toggleForm(t.id, t.name, latest)} className="text-blue-600 hover:underline">
                        {active === t.id ? 'Abbrechen' : 'Bearbeiten'}
                      </button>
                      <button onClick={() => handleDeleteTopic(t.id)} className="text-red-400 hover:text-red-600">
                        Löschen
                      </button>
                    </div>
                  </div>

                  {/* Fortschrittsbalken */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`${progressColor(latest)} h-2 rounded-full transition-all`}
                        style={{ width: `${latest ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">
                      {latest !== null ? `${latest}%` : '–'}
                    </span>
                  </div>

                  {/* Notiz der letzten Eintragung */}
                  {t.progress?.[0]?.note && (
                    <p className="text-xs text-gray-400 italic">"{t.progress[0].note}"</p>
                  )}

                  {/* Fortschritts-Formular (aufklappbar) */}
                  {active === t.id && (
                    <form onSubmit={e => handleSaveProgress(e, t.id, t.name)} className="flex gap-2 pt-1">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="range" min="0" max="100" step="1"
                          value={progressForm.value}
                          onChange={e => setProgressForm({ ...progressForm, value: e.target.value })}
                          className="flex-1 accent-blue-600 cursor-pointer"
                        />
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number" min="0" max="100"
                            value={progressForm.value}
                            onChange={e => {
                              const clamped = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              setProgressForm({ ...progressForm, value: clamped });
                            }}
                            className="w-12 text-center text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5"
                          />
                          <span className="text-sm font-semibold text-blue-700">%</span>
                        </div>
                      </div>
                      <input
                        type="text" placeholder="Notiz (optional)"
                        value={progressForm.note}
                        onChange={e => setProgressForm({ ...progressForm, note: e.target.value })}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700">
                        Speichern
                      </button>
                    </form>
                  )}

                </li>
              );
            })}
          </ul>
        )}

      </main>
    </div>
  );
}
