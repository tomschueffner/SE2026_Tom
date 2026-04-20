import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoIcon from '../components/LogoIcon';

const STRENGTH_COLORS = ['var(--red)', 'var(--red)', 'var(--yellow)', 'var(--yellow)', 'var(--green)'];
const STRENGTH_LABELS = ['sehr unsicher', 'unsicher', 'mittel', 'sicher', 'sehr sicher'];

function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[a-z]/.test(pw))        score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return score;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const errData = err.response?.data?.error;
      if (errData && typeof errData === 'object') {
        setError(Object.values(errData).flat().join('\n'));
      } else {
        setError(errData || 'Registrierung fehlgeschlagen');
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordChange(e) {
    const pw = e.target.value;
    setForm({ ...form, password: pw });
    setStrength(checkStrength(pw));
  }

  return (
    <div className="app-shell">
      <div className="screen-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', height: '100%' }}>
        <Link to="/login" className="btn-link" style={{ marginBottom: 32, textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zurück zum Login
        </Link>

        <div style={{ marginBottom: 32 }}>
          <div className="logo-row" style={{ marginBottom: 12 }}>
            <LogoIcon />
            <span style={{ fontSize: 18, fontWeight: 700 }}>TrackIt</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg2)' }}>Konto erstellen</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="form-label">Name</label>
            <input className="input" type="text" placeholder="Dein Name" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="form-label">E-Mail</label>
            <input className="input" type="email" placeholder="du@hwr.de" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Passwort</label>
            <input className="input" type="password" placeholder="Min. 8 Zeichen" required minLength={8}
              value={form.password} onChange={handlePasswordChange} />

            {/* Stärke-Balken */}
            {form.password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 999,
                      background: i < strength ? STRENGTH_COLORS[strength - 1] : 'var(--bg3)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: strength > 0 ? STRENGTH_COLORS[strength - 1] : 'var(--fg2)' }}>
                  {strength > 0 ? STRENGTH_LABELS[strength - 1] : ''}
                </p>
              </div>
            )}
            <p style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 5 }}>
              Muss Zahl + Sonderzeichen enthalten.
            </p>
          </div>

          {error && <p style={{ fontSize: 13, color: 'var(--red)', whiteSpace: 'pre-line' }}>{error}</p>}

          <button className="btn-primary" type="submit" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Registrieren…' : 'Konto erstellen'}
          </button>
        </form>
      </div>
    </div>
  );
}
