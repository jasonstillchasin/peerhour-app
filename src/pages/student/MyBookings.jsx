import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext.jsx';
import { STUDENT_PAST, TUTORS } from '../../data/index.js';
import { Clock, Pin, ArrowRight } from '../../components/ui/Icons.jsx';

function SessionRow({ s, past, onCancel }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const tutor = TUTORS.find(t => t.id === s.tutorId);

  const handleCancel = (e) => {
    e.stopPropagation();
    setConfirming(true);
  };

  const handleConfirmCancel = (e) => {
    e.stopPropagation();
    onCancel(s.id);
  };

  const handleReschedule = (e) => {
    e.stopPropagation();
    if (tutor) navigate(`/tutor/${tutor.id}`);
  };

  return (
    <div
      className={`session-row${past ? ' past' : ''}`}
      onClick={() => !past && setExpanded(v => !v)}
    >
      <div className="session-row-main">
        <div className="session-date">
          <div className="session-dom">{s.dom}</div>
          <div className="session-mon">{s.month}</div>
          <div className="session-day">{s.day}</div>
        </div>

        <div className="session-body">
          <div className="session-subject">
            <span className={`chip ${(s.subject || '').toLowerCase()}`}>
              <span className="chip-dot" />{s.subject}
            </span>
          </div>
          <div className="session-topic">{s.topic}</div>
          <div className="session-meta">
            <Clock size={12} />
            <span>{s.time}</span>
            <span>·</span>
            <Pin size={12} />
            <span>{s.location}</span>
          </div>
        </div>

        {tutor && (
          <button
            className="session-tutor"
            onClick={(e) => { e.stopPropagation(); navigate(`/tutor/${tutor.id}`); }}
          >
            <div className={`avatar sm ${tutor.avatarBg}`}>{tutor.initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{tutor.name}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                {past ? 'View profile' : 'Message →'}
              </div>
            </div>
          </button>
        )}
      </div>

      {expanded && !past && (
        <div className="session-expand-actions" onClick={e => e.stopPropagation()}>
          {confirming ? (
            <>
              <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Cancel this session?</span>
              <button className="btn" style={{ fontSize: 13 }} onClick={e => { e.stopPropagation(); setConfirming(false); }}>Keep it</button>
              <button
                className="btn"
                style={{ fontSize: 13, color: 'var(--danger, #c0392b)', borderColor: 'var(--danger, #c0392b)' }}
                onClick={handleConfirmCancel}
              >
                Yes, cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn" style={{ fontSize: 13 }} onClick={handleReschedule}>
                Reschedule
              </button>
              <button
                className="btn"
                style={{ fontSize: 13, color: 'var(--danger, #c0392b)', borderColor: 'var(--danger, #c0392b)' }}
                onClick={handleCancel}
              >
                Cancel session
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  const { allStudentSessions, cancelStudentSession } = useAppData();
  const navigate = useNavigate();
  const uniqueTutors = [...new Set(allStudentSessions.map(s => s.tutorId))].length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Student dashboard</div>
          <h1 className="page-title">My <em>sessions</em></h1>
          <p className="page-sub">Click any upcoming session to reschedule or cancel.</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/browse')}>
          Book a session <ArrowRight size={15} />
        </button>
      </div>

      <div className="stats-row-3">
        {[
          { v: allStudentSessions.length, label: 'upcoming sessions' },
          { v: STUDENT_PAST.length,       label: 'completed sessions' },
          { v: uniqueTutors,              label: 'tutors working with' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-value serif">{s.v}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="eyebrow" style={{ marginBottom: 16 }}>Upcoming</div>
      {allStudentSessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-muted)' }}>
          <p style={{ marginBottom: 16 }}>No upcoming sessions yet.</p>
          <button className="btn primary" onClick={() => navigate('/browse')}>Find a tutor</button>
        </div>
      ) : (
        <div className="sessions-list">
          {allStudentSessions.map(s => (
            <SessionRow key={s.id} s={s} onCancel={cancelStudentSession} />
          ))}
        </div>
      )}

      {STUDENT_PAST.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 40, marginBottom: 16 }}>Past sessions</div>
          <div className="sessions-list">
            {STUDENT_PAST.map(s => <SessionRow key={s.id} s={s} past />)}
          </div>
        </>
      )}
    </div>
  );
}
