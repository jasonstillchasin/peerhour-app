import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { Mail, LogIn } from '../../components/ui/Icons.jsx';

export default function Login() {
  const { requestLoginOTP, verifyLoginOTP, loginDirect } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goTo = (role) => navigate(role === 'tutor' ? '/tutor/dashboard' : '/browse');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestLoginOTP(email.trim());
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verifyLoginOTP(email.trim(), code.trim());
      goTo(user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tryDemo = (em, pw) => {
    setError('');
    try {
      const user = loginDirect(em, pw);
      goTo(user.role);
    } catch {
      setError('Demo login failed.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo serif">Reddux</div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Reddam House North Shore peer tutoring</p>

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="auth-form">
            <label className="field-label">School email</label>
            <div className="input-group">
              <Mail size={15} className="input-icon" />
              <input
                type="email"
                className="input"
                placeholder="you@reddamnorthshore.nsw.edu.au"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="pill" style={{ background: 'var(--danger-wash)', color: 'var(--danger)', marginTop: 8 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn primary lg"
              style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <LogIn size={15} />
              {loading ? 'Sending…' : 'Send one-time code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form">
            <div style={{ background: 'var(--bg-sunk)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 20, fontSize: 13 }}>
              <div style={{ color: 'var(--fg-muted)', marginBottom: 2 }}>Code sent to</div>
              <div style={{ fontWeight: 600, color: 'var(--fg)' }}>{email}</div>
              <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 6 }}>Check your inbox — it may take a few seconds.</div>
            </div>

            <label className="field-label">Enter your 6-digit code</label>
            <input
              type="text"
              className="input"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              style={{ letterSpacing: '0.2em', fontFamily: 'var(--font-mono)', fontSize: 20, textAlign: 'center' }}
            />

            {error && (
              <div className="pill" style={{ background: 'var(--danger-wash)', color: 'var(--danger)', marginTop: 8 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn primary lg"
              style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
              disabled={loading || code.length < 6}
            >
              <LogIn size={15} />
              {loading ? 'Verifying…' : 'Sign in'}
            </button>

            <button
              type="button"
              className="btn"
              style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: 13 }}
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Demo accounts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Student — Jordan', email: 'jordan@rhns.nsw.edu.au', pw: 'student123' },
              { label: 'Tutor — Jason',    email: 'jason@rhns.nsw.edu.au',   pw: 'tutor123' },
              { label: 'Tutor — Bach',     email: 'bach@rhns.nsw.edu.au',    pw: 'tutor123' },
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
