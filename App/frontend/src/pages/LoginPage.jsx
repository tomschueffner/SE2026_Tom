import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login fehlgeschlagen');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">TrackIt — Login</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="E-Mail" required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <input
            type="password" placeholder="Passwort" required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <button type="submit" className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-blue-700">
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Noch kein Konto? <Link to="/register" className="text-blue-600 hover:underline">Registrieren</Link>
        </p>
      </div>
    </div>
  );
}
