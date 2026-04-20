import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { progressColor } from '../utils/progressColor';
import ProgressPieChart from '../components/ProgressPieChart';

function avgProgress(topics) {
  const withProgress = topics.filter(t => t.progress?.[0]);
  if (!withProgress.length) return null;
  return Math.round(withProgress.reduce((sum, t) => sum + t.progress[0].value, 0) / withProgress.length);
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
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
    try {
      const { data } = await api.post('/subjects', { name: newName });
      setSubjects([{ ...data, topics: [] }, ...subjects]);
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Anlegen');
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation(); // nicht zur SubjectPage navigieren
    await api.delete(`/subjects/${id}`);
    setSubjects(subjects.filter(s => s.id !== id));
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // Sortierte Fächer — höchster Fortschritt oben (Feature #4)
  // Fächer ohne Fortschritt (null) landen am Ende
  const sortedSubjects = [...subjects].sort((a, b) => {
    const aAvg = avgProgress(a.topics);
    const bAvg = avgProgress(b.topics);
    if (aAvg === null && bAvg === null) return 0;
    if (aAvg === null) return 1;
    if (bAvg === null) return -1;
    return bAvg - aAvg;
  });

  // Globale Statistiken (Feature #5)
  const totalSubjects = subjects.length;
  const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
  const allTopicsWithProgress = subjects.flatMap(s => s.topics).filter(t => t.progress?.[0]);
  const overallAvg = allTopicsWithProgress.length
    ? Math.round(allTopicsWithProgress.reduce((sum, t) => sum + t.progress[0].value, 0) / allTopicsWithProgress.length)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">TrackIt</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-6">

        {/* Statistiken-Dach (Feature #5) */}
        {totalSubjects > 0 && (
          <div className="bg-white border rounded-lg px-5 py-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{totalSubjects}</div>
              <div className="text-xs text-gray-500 mt-1">Fächer</div>
            </div>
            <div className="border-x">
              <div className="text-2xl font-bold text-gray-800">{totalTopics}</div>
              <div className="text-xs text-gray-500 mt-1">Themen</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                overallAvg === null ? 'text-gray-400' :
                overallAvg >= 80    ? 'text-green-600' :
                overallAvg >= 50    ? 'text-yellow-600' :
                                      'text-red-600'
              }`}>
                {overallAvg !== null ? `${overallAvg}%` : '–'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Ø Fortschritt</div>
            </div>
          </div>
        )}

        {/* Fortschritts-Tortendiagramm */}
        {subjects.length > 0 && <ProgressPieChart subjects={subjects} />}

        {/* Neues Fach */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text" placeholder="Neues Fach (z.B. Mathe)" required
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700">
            Hinzufügen
          </button>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Fächer-Liste (sortiert) */}
        {sortedSubjects.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Fächer angelegt.</p>
        ) : (
          <ul className="space-y-3">
            {sortedSubjects.map(s => {
              const avg = avgProgress(s.topics);
              return (
                <li
                  key={s.id}
                  onClick={() => navigate(`/subjects/${s.id}`, { state: { name: s.name } })}
                  className="bg-white border rounded px-4 py-3 space-y-2 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{s.topics.length} {s.topics.length === 1 ? 'Thema' : 'Themen'}</span>
                      <button
                        onClick={e => handleDelete(e, s.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>

                  {/* Fortschrittsbalken (farbkodiert — Feature #2) */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`${progressColor(avg)} h-2 rounded-full transition-all`}
                        style={{ width: `${avg ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {avg !== null ? `${avg}%` : '–'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      </main>
    </div>
  );
}
