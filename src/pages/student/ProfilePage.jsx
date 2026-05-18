import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { TUTORS, SUBJECTS } from '../../data/index.js';
import { LogOut, Settings } from '../../components/ui/Icons.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isTutor = user?.role === 'tutor';
  const tutor = isTutor ? (TUTORS.find(t => t.id === user?.tutorId) || null) : null;

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">Account</div>
          <h1 className="page-title">Your <em>profile</em></h1>
        </div>
      </div>

      {/* Avatar + name card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '20px 24px', marginBottom: 24,
        background: 'var(--bg-elev)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}>
        <div className={`avatar xl ${user?.avatarColor || 'avatar-c1'}`}>
          {user?.initials || '?'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
          <span className="pill" style={{ fontSize: 11, textTransform: 'capitalize' }}>
            {isTutor ? 'Tutor' : 'Student'}
          </span>
        </div>
      </div>

      {/* Student details */}
      {!isTutor && (user?.year || user?.house) && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24,
        }}>
          {user?.year && (
            <div style={{ padding: '14px 16px', background: 'var(--bg-elev)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Year</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Year {user.year}</div>
            </div>
          )}
          {user?.house && (
            <div style={{ padding: '14px 16px', background: 'var(--bg-elev)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>House</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{user.house}</div>
            </div>
          )}
        </div>
      )}

      {/* Tutor info */}
      {isTutor && tutor && (
        <div style={{ marginBottom: 24, padding: '16px 20px', background: 'var(--bg-elev)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 10 }}>
            {tutor.year} · {tutor.major}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {tutor.subjects.map(s => (
              <span key={s} className={`chip ${s}`}>
                <span className="chip-dot" />
                {SUBJECTS.find(sub => sub.id === s)?.name || s}
              </span>
            ))}
          </div>
          <Link to="/tutor/profile" className="btn" style={{ fontSize: 13, gap: 6 }}>
            <Settings size={14} /> Edit tutor profile
          </Link>
        </div>
      )}

      {/* Sign out */}
      <div style={{ paddingTop: 8 }}>
        <button
          className="btn lg"
          style={{ width: '100%', justifyContent: 'center', gap: 8, color: 'var(--danger, #c0392b)', borderColor: 'var(--danger, #c0392b)' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
