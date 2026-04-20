import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STRENGTH_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-lime-500', 'bg-green-500'];
const STRENGTH_TEXT   = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-600', 'text-green-600'];
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
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
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
    }
  }

  function handlePasswordChange(e) {
    const pw = e.target.value;
    setForm({ ...form, password: pw });
    setStrength(checkStrength(pw));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">TrackIt — Registrieren</h1>
        {error && <p className="text-red-500 mb-4 text-sm whitespace-pre-line">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Name" required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <input
            type="email" placeholder="E-Mail" required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Passwort (min. 8 Zeichen, a-z, A-Z, 0-9, Sonderzeichen)"
              required minLength={8}
              value={form.password}
              onChange={handlePasswordChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {/* Stärke-Balken */}
            <div className="flex gap-1">
              {STRENGTH_COLORS.map((color, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${i < strength ? color : 'bg-gray-200'}`}
                />
              ))}
            </div>
            {form.password.length > 15 && (
              <p className="text-xs font-medium text-red-500">
                Passwort darf maximal 15 Zeichen haben ({form.password.length}/15)
              </p>
            )}
            {strength > 0 && form.password.length <= 15 && (
              <p className={`text-xs font-medium ${STRENGTH_TEXT[strength - 1]}`}>
                {STRENGTH_LABELS[strength - 1]}
              </p>
            )}
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-blue-700">
            Registrieren
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Schon ein Konto? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
