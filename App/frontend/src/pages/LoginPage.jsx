import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoIcon from '../components/LogoIcon';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div
        className="screen-scroll"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '32px 24px',
          height: '100%',
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <div className="logo-row" style={{ marginBottom: 12 }}>
            <LogoIcon />
            <span style={{ fontSize: 18, fontWeight: 700 }}>TrackIt</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.5 }}>
            Lernfortschritt im Blick behalten.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div>
            <label className="form-label">E-Mail</label>
            <input
              className="input"
              type="email"
              placeholder="du@hwr.de"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Passwort</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--red)',
                marginTop: 4,
              }}
            >
              {error}
            </p>
          )}

          <button
            className="btn-primary"
            type="submit"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>

        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: 'var(--fg2)',
            textAlign: 'center',
          }}
        >
          Noch kein Konto?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
