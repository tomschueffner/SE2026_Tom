import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import BottomTabBar from '../components/BottomTabBar';

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data)).catch(() => {});
  }, []);

  const totalSubjects = subjects.length;
  const totalTopics = subjects.reduce((s, x) => s + x.topics.length, 0);
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  async function handleLogout() {
    try { await logout(); } catch (_) {}
    navigate('/login');
  }

  const settingsRows = [
    { label: 'Konto', icon: '👤', sub: user?.email || '' },
    { label: 'Passwort ändern', icon: '🔒', sub: '' },
    { label: 'Benachrichtigungen', icon: '🔔', sub: 'Aus' },
    { label: 'App-Version', icon: 'ℹ️', sub: '1.0.0' },
  ];

  return (
    <div className="app-shell">
      <div className="screen">
        <div className="header">
          <span className="header-title">Profil</span>
        </div>

        <div className="screen-scroll">
          {/* Avatar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 0 28px',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--accent-dim)',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}
              >
                {initial}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>
              {user?.name || 'Unbekannt'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg2)', marginTop: 4 }}>
              {user?.email || ''}
            </div>
          </div>

          {/* Stats */}
          <div
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              marginBottom: 20,
              padding: '12px 0',
            }}
          >
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{totalSubjects}</div>
              <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 2 }}>
                Fächer
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '8px 0',
                borderLeft: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700 }}>{totalTopics}</div>
              <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 2 }}>
                Themen
              </div>
            </div>
          </div>

          {/* Settings rows */}
          {settingsRows.map(row => (
            <div key={row.label} className="settings-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{row.icon}</span>
                <span style={{ fontSize: 14 }}>{row.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {row.sub && (
                  <span style={{ fontSize: 12, color: 'var(--fg2)' }}>
                    {row.sub}
                  </span>
                )}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--fg3)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}

          <button
            className="btn-danger"
            onClick={handleLogout}
            style={{ marginTop: 24 }}
          >
            Abmelden
          </button>
          <div style={{ height: 24 }} />
        </div>

        <BottomTabBar />
      </div>
    </div>
  );
}
