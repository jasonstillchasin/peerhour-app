import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { useAppData } from '../../store/AppDataContext.jsx';
import { TUTORS, SLOTS } from '../../data/index.js';
import { Calendar, Clock, Users, Star, Plus } from '../../components/ui/Icons.jsx';

function TutorSessionRow({ s, onCancel }) {
  const [expanded, setExpanded] = useState(false);

  const handleCancel = (e) => {
    e.stopPropagation();
    if (window.confirm(`Cancel session with ${s.studentName}?`)) onCancel(s.id);
  };

  return (
    <div className="session-row" onClick={() => setExpanded(v => !v)}>
      <div className="session-row-main">
        <div className="session-date">
          <div className="session-dom">{s.dom}</div>
          <div className="session-mon">{s.month}</div>
          <div className="session-day">{s.day}</div>
        </div>

        <div className="session-body">
          <div className="session-subject">
            <span className={`chip ${s.subject.toLowerCase()}`}><span className="chip-dot" />{s.subject}</span>
          </div>
          <div className="session-topic">{s.topic}</div>
          <div className="session-meta">
            <Clock size={12} />
            <span>{s.time}</span>
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className={`avatar sm ${s.studentColor}`}>{s.studentInitials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{s.studentName}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Student</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="session-expand-actions" onClick={e => e.stopPropagation()}>
          <button
            className="btn"
            style={{ fontSize: 13, color: 'var(--danger, #c0392b)', borderColor: 'var(--danger, #c0392b)' }}
            onClick={handleCancel}
          >
            Cancel session
          </button>
        </div>
      )}
    </div>
  );
}

export default function TutorDash() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tutorSessionsList, cancelTutorSession } = useAppData();
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
          <p className="page-sub">Click any session to manage it.</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/tutor/upload')}>
          <Plus size={15} /> Upload content
        </button>
      </div>

      <div className="stats-row-4">
        {[
          { icon: Calendar, v: tutorSessionsList.length, label: 'upcoming sessions' },
          { icon: Users,    v: tutor.sessionsCount,      label: 'total sessions' },
          { icon: Star,     v: tutor.rating,             label: 'avg rating' },
          { icon: Clock,    v: freeCount,                label: 'open slots this week' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={18} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <div className="stat-card-value serif">{s.v}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="eyebrow" style={{ marginBottom: 14 }}>Upcoming sessions</div>
      {tutorSessionsList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-muted)' }}>
          <p>No upcoming sessions.</p>
        </div>
      ) : (
        <div className="sessions-list">
          {tutorSessionsList.map(s => (
            <TutorSessionRow key={s.id} s={s} onCancel={cancelTutorSession} />
          ))}
        </div>
      )}
    </div>
  );
}
