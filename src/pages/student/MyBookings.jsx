import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { STUDENT_SESSIONS, STUDENT_PAST, TUTORS, SUBJECTS } from '../../data/index.js';
import { Calendar, Clock, Pin, ArrowRight } from '../../components/ui/Icons.jsx';

function SessionRow({ s, past }) {
  const navigate = useNavigate();
  const tutor = TUTORS.find(t => t.id === s.tutorId);
  return (
    <div className={`session-row ${past ? 'past' : ''}`}>
      <div className="session-date">
        <div className="session-dom serif">{s.dom}</div>
        <div className="session-mon">{s.month}</div>
        <div className="session-day">{s.day}</div>
      </div>
      <div className="session-body">
        <div className="session-subject">
          <span className={`chip ${s.subject.toLowerCase()}`}>
            <span className="chip-dot" />{s.subject}
          </span>
        </div>
        <h3 className="session-topic">{s.topic}</h3>
        <div className="session-meta">
          <Clock size={13} style={{ color: 'var(--fg-muted)' }} />
          <span>{s.time}</span>
          <span style={{ color: 'var(--fg-soft)' }}>·</span>
          <Pin size={13} style={{ color: 'var(--fg-muted)' }} />
          <span>{s.location}</span>
        </div>
      </div>
      {tutor && (
        <button className="session-tutor" onClick={() => navigate(`/tutor/${tutor.id}`)}>
          <div className={`avatar sm ${tutor.avatarBg}`}>{tutor.initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{tutor.name}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{past ? 'View profile' : 'Message →'}</div>
          </div>
        </button>
      )}
    </div>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Student dashboard</div>
          <h1 className="page-title">My <em>sessions</em></h1>
          <p className="page-sub">Upcoming and past tutoring sessions.</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/browse')}>
          Book a session <ArrowRight size={15} />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
        {[
          { v: STUDENT_SESSIONS.length, label: 'upcoming sessions' },
          { v: STUDENT_PAST.length, label: 'completed sessions' },
          { v: TUTORS.filter(t => STUDENT_SESSIONS.some(s => s.tutorId === t.id)).length, label: 'tutors working with' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-value serif">{s.v}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="eyebrow" style={{ marginBottom: 16 }}>Upcoming</div>
      <div className="sessions-list">
        {STUDENT_SESSIONS.map(s => <SessionRow key={s.id} s={s} />)}
      </div>

      {STUDENT_PAST.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 36, marginBottom: 16 }}>Past sessions</div>
          <div className="sessions-list">
            {STUDENT_PAST.map(s => <SessionRow key={s.id} s={s} past />)}
          </div>
        </>
      )}
    </div>
  );
}
