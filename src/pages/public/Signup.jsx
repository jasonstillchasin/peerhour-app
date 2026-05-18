import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { User, Mail, ArrowRight } from '../../components/ui/Icons.jsx';

const HOUSES = ['Warringah', 'Narrabeen', 'Bilgola', 'Kirribilli'];
const YEARS = [7, 8, 9, 10, 11];

export default function Signup() {
  const { requestSignupOTP, verifySignupOTP } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'details'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [shownCode, setShownCode] = useState('');
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [house, setHouse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const generated = requestSignupOTP(email.trim());
      setShownCode(generated);
      setStep('details');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = verifySignupOTP(email.trim(), code.trim(), name, year, house);
      navigate(user.role === 'tutor' ? '/tutor/dashboard' : '/browse');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canCreate = name && code.length === 6 && year && house;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo serif">peerhour</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Reddam House North Shore peer tutoring</p>

        <div style={{ background: 'var(--bg-sunk)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 24, fontSize: 13, color: 'var(--fg-muted)' }}>
          Signing up as a <strong style={{ color: 'var(--fg)' }}>student</strong>. Tutor accounts are for <strong style={{ color: 'var(--fg)' }}>Year 11 students</strong> only — sign up and we'll upgrade your account.
        </div>

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
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 6 }}>
              Must be a @reddamnorthshore.nsw.edu.au school email.
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
              <ArrowRight size={15} />
              {loading ? 'Sending…' : 'Send verification code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="auth-form">
            <div style={{ background: 'var(--bg-sunk)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 20, fontSize: 13 }}>
              <div style={{ color: 'var(--fg-muted)', marginBottom: 4 }}>Code sent to <strong style={{ color: 'var(--fg)' }}>{email}</strong></div>
              <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginBottom: 10 }}>
                (Demo mode — no real email sent. Your code is shown below.)
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: '0.2em', fontWeight: 700, color: 'var(--accent)', textAlign: 'center', padding: '10px 0' }}>
                {shownCode}
              </div>
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
              style={{ letterSpacing: '0.2em', fontFamily: 'var(--font-mono)', fontSize: 20, textAlign: 'center', marginBottom: 16 }}
            />

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

            {error && (
              <div className="pill" style={{ background: 'var(--danger-wash)', color: 'var(--danger)', marginTop: 10, width: '100%', justifyContent: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn primary lg"
              style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
              disabled={loading || !canCreate}
            >
              {loading ? 'Creating account…' : <><ArrowRight size={15} /> Create account</>}
            </button>

            <button
              type="button"
              className="btn"
              style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: 13 }}
              onClick={() => { setStep('email'); setCode(''); setShownCode(''); setError(''); }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
