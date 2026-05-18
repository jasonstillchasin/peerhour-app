import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { User, Mail, Lock, ArrowRight } from '../../components/ui/Icons.jsx';

const HOUSES = ['Warringah', 'Narrabeen', 'Bilgola', 'Kirribilli'];
const YEARS = [7, 8, 9, 10, 11];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('');
  const [house, setHouse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const user = signup(name, email, password, 'student', { year: Number(year), house });
      navigate(user.role === 'tutor' ? '/tutor/dashboard' : '/browse');
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name && email && password && year && house;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo serif">peerhour</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Reddam House North Shore peer tutoring</p>

        <div style={{ background: 'var(--bg-sunk)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 24, fontSize: 13, color: 'var(--fg-muted)' }}>
          Signing up as a <strong style={{ color: 'var(--fg)' }}>student</strong>. Tutor accounts are for <strong style={{ color: 'var(--fg)' }}>Year 11 students</strong> only — if you're in Year 11 and want to tutor, sign up and we'll upgrade your account.
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">Full name</label>
          <div className="input-group">
            <User size={15} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Jordan Pierce"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <label className="field-label" style={{ marginTop: 14 }}>School email</label>
          <div className="input-group">
            <Mail size={15} className="input-icon" />
            <input
              type="email"
              className="input"
              placeholder="you@rhns.nsw.edu.au"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div>
              <label className="field-label">Year</label>
              <select
                className="input"
                value={year}
                onChange={e => setYear(e.target.value)}
                required
                style={{ marginTop: 6 }}
              >
                <option value="">Select…</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">House</label>
              <select
                className="input"
                value={house}
                onChange={e => setHouse(e.target.value)}
                required
                style={{ marginTop: 6 }}
              >
                <option value="">Select…</option>
                {HOUSES.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="field-label" style={{ marginTop: 14 }}>Password</label>
          <div className="input-group">
            <Lock size={15} className="input-icon" />
            <input
              type="password"
              className="input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="pill" style={{ background: 'var(--danger-wash)', color: 'var(--danger)', marginTop: 10, width: '100%', justifyContent: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn primary lg"
            style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
            disabled={loading || !canSubmit}
          >
            {loading ? 'Creating account…' : <><ArrowRight size={15} /> Create account</>}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
