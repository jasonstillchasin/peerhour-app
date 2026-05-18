import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { Mail, Lock, LogIn } from '../../components/ui/Icons.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = login(email.trim(), password);
      navigate(user.role === 'tutor' ? '/tutor/dashboard' : '/browse');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const tryDemo = (em, pw) => {
    setError('');
    try {
      const user = login(em, pw);
      navigate(user.role === 'tutor' ? '/tutor/dashboard' : '/browse');
    } catch {
      setError('Demo login failed.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo serif">peerhour</div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Reddam House North Shore peer tutoring</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">Email</label>
          <div className="input-group">
            <Mail size={15} className="input-icon" />
            <input
              type="email"
              className="input"
              placeholder="you@rhns.nsw.edu.au"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="field-label" style={{ marginTop: 14 }}>Password</label>
          <div className="input-group">
            <Lock size={15} className="input-icon" />
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="pill" style={{ background: 'var(--danger-wash)', color: 'var(--danger)', marginTop: 8 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn primary lg" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }} disabled={loading}>
            <LogIn size={15} />
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Demo accounts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Student — Jordan', email: 'jordan@rhns.nsw.edu.au', pw: 'student123' },
              { label: 'Tutor — Maya', email: 'maya@rhns.nsw.edu.au', pw: 'tutor123' },
              { label: 'Tutor — Rohan', email: 'rohan@rhns.nsw.edu.au', pw: 'tutor123' },
            ].map(d => (
              <button
                key={d.email}
                type="button"
                className="btn"
                style={{ justifyContent: 'flex-start', fontSize: 13 }}
                onClick={() => tryDemo(d.email, d.pw)}
              >
                <span style={{ flex: 1 }}>{d.label}</span>
                <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{d.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center' }}>
          New student?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)' }}>Create an account →</Link>
        </p>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center' }}>
          Just browsing?{' '}
          <Link to="/lectures" style={{ color: 'var(--accent)' }}>View peer lectures →</Link>
        </p>
      </div>
    </div>
  );
}
