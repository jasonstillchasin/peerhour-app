import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { TUTORS, TUTOR_SESSIONS, SLOTS } from '../../data/index.js';
import { Calendar, Clock, Users, Star, Plus } from '../../components/ui/Icons.jsx';

export default function TutorDash() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tutor = TUTORS.find(t => t.id === user?.tutorId) || TUTORS[0];

  const tutorSlots = SLOTS[tutor.id] || {};
  const freeCount = Object.values(tutorSlots).reduce((sum, day) =>
    sum + Object.values(day).filter(v => v === 0).length, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Tutor dashboard</div>
          <h1 className="page-title">Hey, <em>{tutor.name.split(' ')[0]}</em></h1>
          <p className="page-sub">Manage your availability and see your upcoming sessions.</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/tutor/upload')}>
          <Plus size={15} /> Upload content
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
        {[
          { icon: Calendar, v: TUTOR_SESSIONS.length, label: 'upcoming sessions' },
          { icon: Users, v: tutor.sessionsCount, label: 'total sessions' },
          { icon: Star, v: tutor.rating, label: 'avg rating' },
          { icon: Clock, v: freeCount, label: 'open slots this week' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <div className="stat-card-value serif">{s.v}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming sessions */}
      <div className="eyebrow" style={{ marginBottom: 12 }}>Upcoming sessions</div>
      <div className="sessions-list">
        {TUTOR_SESSIONS.map(s => (
          <div key={s.id} className="session-row">
            <div className="session-date">
              <div className="session-dom serif">{s.dom}</div>
              <div className="session-mon">{s.month}</div>
              <div className="session-day">{s.day}</div>
            </div>
            <div className="session-body">
              <div style={{ marginBottom: 4 }}>
                <span className={`chip ${s.subject.toLowerCase()}`}><span className="chip-dot" />{s.subject}</span>
              </div>
              <h3 className="session-topic">{s.topic}</h3>
              <div className="session-meta">
                <Clock size={13} style={{ color: 'var(--fg-muted)' }} />
                <span>{s.time}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={`avatar sm ${s.studentColor}`}>{s.studentInitials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.studentName}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Student</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
