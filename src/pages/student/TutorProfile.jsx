import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TUTORS, SUBJECTS, SLOTS, DAYS, DAY_NUMS, HOURS, MOCK_USERS } from '../../data/index.js';
import { useAuth } from '../../store/AuthContext.jsx';
import { useAppData } from '../../store/AppDataContext.jsx';
import { Star, ArrowLeft, Calendar, Clock, Pin, Check } from '../../components/ui/Icons.jsx';

function SlotCell({ dayIdx, hour, slots, selected, onSelect }) {
  const val = slots?.[hour];
  const free = val === 0;
  const booked = val === 1;
  const isSel = selected?.day === dayIdx && selected?.hour === hour;
  const unavailable = val === undefined;

  let cls = 'empty';
  if (isSel) cls = 'selected';
  else if (free) cls = 'free';
  else if (booked) cls = 'booked';

  return (
    <button
      type="button"
      className={`cal-cell ${cls}`}
      onClick={() => free && !isSel && onSelect({ day: dayIdx, hour })}
      disabled={booked || unavailable || isSel}
    >
      {isSel && <Check size={12} />}
    </button>
  );
}

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useAppData();
  const tutor = TUTORS.find(t => t.id === id);
  const tutorUser = MOCK_USERS.find(u => u.tutorId === id);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('Library');
  const [confirmed, setConfirmed] = useState(false);
  const [guestPrompt, setGuestPrompt] = useState(false);

  if (!tutor) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p>Tutor not found.</p>
      <button className="btn" onClick={() => navigate('/browse')}>Back to browse</button>
    </div>
  );

  const tutorSlots = SLOTS[tutor.id] || {};

  const handleSelect = (slot) => {
    if (!user) { setGuestPrompt(true); return; }
    setSelected(slot);
    setGuestPrompt(false);
  };

  const handleConfirm = () => {
    if (!selected || !subject) return;
    addBooking({
      tutorId: tutor.id,
      subject: SUBJECTS.find(s => s.id === subject)?.name || subject,
      topic: topic || 'General help',
      day: DAYS[selected.day],
      dom: DAY_NUMS[selected.day],
      month: 'May',
      time: `${HOURS[selected.hour]} – 1 hour`,
      location,
    });
    setConfirmed(true);
  };

  if (confirmed) {
    const day = DAYS[selected.day];
    const hour = HOURS[selected.hour];
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 40 }}>
        <div className="confirm-card">
          <div className="confirm-check">
            <Check size={28} style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="serif confirm-title">Session booked!</h2>
          <p className="confirm-sub">Your session with {tutor.name} is confirmed.</p>
          <div className="confirm-details">
            <div className="confirm-row">
              <Calendar size={15} style={{ color: 'var(--fg-muted)' }} />
              <span>{day}, May {DAY_NUMS[selected.day]}</span>
            </div>
            <div className="confirm-row">
              <Clock size={15} style={{ color: 'var(--fg-muted)' }} />
              <span>{hour} – 1 hour</span>
            </div>
            <div className="confirm-row">
              <Pin size={15} style={{ color: 'var(--fg-muted)' }} />
              <span>{location}</span>
            </div>
          </div>
          <div className="confirm-subject">
            <span className={`chip ${subject}`}>
              <span className="chip-dot" />{SUBJECTS.find(s => s.id === subject)?.name}
            </span>
            {topic && <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 8 }}>{topic}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn primary" onClick={() => navigate('/sessions')}>
              View my sessions
            </button>
            <button className="btn" onClick={() => navigate('/browse')}>Browse more</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn" style={{ marginBottom: 24 }} onClick={() => navigate('/browse')}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="profile-layout">
        {/* Left column */}
        <aside className="profile-aside">
          <div className={`avatar xl ${tutor.avatarBg}`}>{tutor.initials}</div>
          <h2 className="profile-name serif">{tutor.name}</h2>
          <div className="profile-meta">{tutor.year} · {tutor.major}</div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {tutor.subjects.map(s => (
              <span key={s} className={`chip ${s}`}>
                <span className="chip-dot" />{SUBJECTS.find(sub => sub.id === s)?.name}
              </span>
            ))}
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <Star size={14} style={{ color: 'var(--accent)' }} />
              <strong>{tutor.rating}</strong>
              <span style={{ color: 'var(--fg-muted)' }}>rating</span>
            </div>
            <div className="profile-stat">
              <strong>{tutor.sessionsCount}</strong>
              <span style={{ color: 'var(--fg-muted)' }}>sessions</span>
            </div>
          </div>

          <p className="profile-bio">{tutor.bio}</p>
          <p className="profile-bio" style={{ marginTop: 8 }}>{tutor.bio2}</p>

          {tutorUser?.email && (
            <div style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Contact</div>
              <a
                href={`mailto:${tutorUser.email}`}
                style={{ fontSize: 13, color: 'var(--accent)', wordBreak: 'break-all' }}
              >
                {tutorUser.email}
              </a>
            </div>
          )}

          {tutor.favoriteUnits && (
            <div style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Favourite units</div>
              {tutor.favoriteUnits.map(u => (
                <div key={u} style={{ fontSize: 13, color: 'var(--fg-muted)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                  {u}
                </div>
              ))}
            </div>
          )}

          {tutor.languages && (
            <div style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Languages</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {tutor.languages.map(l => <span key={l} className="pill">{l}</span>)}
              </div>
            </div>
          )}
        </aside>

        {/* Right column — calendar + booking */}
        <div>
          {!user && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 14 }}>
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
              {' '}or{' '}
              <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 500 }}>create an account</Link>
              {' '}to book a session with {tutor.name.split(' ')[0]}.
            </div>
          )}

          {guestPrompt && (
            <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--danger-wash)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--danger)' }}>
              You need to <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>sign in</Link> to select a slot and book a session.
            </div>
          )}

          <div className="eyebrow" style={{ marginBottom: 12 }}>Availability — week of May 19</div>
          <div className="cal-wrap">
            <div className="cal-header">
              <div className="cal-time-col" />
              {DAYS.map((d, i) => (
                <div key={d} className="cal-day-head">
                  <div className="cal-day-name">{d}</div>
                  <div className="cal-day-date">May {DAY_NUMS[i]}</div>
                </div>
              ))}
            </div>
            <div className="cal-body">
              {HOURS.map((h, hi) => (
                <div key={h} className="cal-row">
                  <div className="cal-time">{h}</div>
                  {DAYS.map((_, di) => (
                    <SlotCell
                      key={di}
                      dayIdx={di}
                      hour={hi}
                      slots={tutorSlots[di]}
                      selected={selected}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="cal-legend">
              <span className="cal-legend-item"><span className="cal-dot free" /> Available</span>
              <span className="cal-legend-item"><span className="cal-dot booked" /> Booked</span>
            </div>
          </div>

          {/* Booking form */}
          {selected && user && (
            <div className="booking-panel">
              <div className="eyebrow" style={{ marginBottom: 14 }}>Book session</div>
              <div className="booking-slot-summary">
                <Calendar size={14} style={{ color: 'var(--fg-muted)' }} />
                {DAYS[selected.day]}, May {DAY_NUMS[selected.day]} · {HOURS[selected.hour]}
              </div>

              <label className="field-label">Subject</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {tutor.subjects.map(s => (
                  <button
                    key={s}
                    className={`chip ${s} ${subject === s ? 'active' : ''}`}
                    onClick={() => setSubject(s)}
                  >
                    <span className="chip-dot" />{SUBJECTS.find(sub => sub.id === s)?.name}
                  </button>
                ))}
              </div>

              <label className="field-label">Location</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['Library', 'Computer Lab', 'Online'].map(l => (
                  <button
                    key={l}
                    className={`chip ${location === l ? 'active' : ''}`}
                    onClick={() => setLocation(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <label className="field-label">Topic / notes (optional)</label>
              <textarea
                className="input"
                style={{ height: 80, resize: 'vertical', marginBottom: 16 }}
                placeholder="e.g. Need help with series convergence tests…"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />

              <button
                className="btn primary lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleConfirm}
                disabled={!subject}
              >
                Confirm booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
