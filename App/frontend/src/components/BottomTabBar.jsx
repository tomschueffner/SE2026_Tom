import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  {
    key: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: 'fortschritt',
    path: '/fortschritt',
    label: 'Fortschritt',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    key: 'profil',
    path: '/profil',
    label: 'Profil',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
  },
];

export default function BottomTabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // "aktiv" auch für Unter-Routes (z.B. /subjects/:id → Dashboard-Tab bleibt aktiv)
  function isActive(tabKey) {
    if (tabKey === 'dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/subjects');
    }
    return pathname.startsWith('/' + tabKey);
  }

  return (
    <nav className="tab-bar">
      {tabs.map(t => (
        <button
          key={t.key}
          className={`tab-item ${isActive(t.key) ? 'active' : ''}`}
          onClick={() => navigate(t.path)}
          type="button"
        >
          {t.icon}
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
