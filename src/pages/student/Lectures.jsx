import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PEER_LECTURES, SUBJECTS } from '../../data/index.js';
import { useAuth } from '../../store/AuthContext.jsx';
import { useAppData } from '../../store/AppDataContext.jsx';
import { Bell, Clock, Pin, Check, Mic, Bookmark, X } from '../../components/ui/Icons.jsx';

function fullDayName(abbr) {
  return { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }[abbr] || abbr;
}

function Modal({ onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div ref={ref} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4 }}>
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

function LectureCard({ lecture: l, rsvped, onRsvp, onPickTutor }) {
  const pct = (l.rsvp / l.capacity) * 100;
  const nearlyFull = pct >= 75;
  return (
    <article className={`lec-card ${rsvped ? 'going' : ''}`}>
      <div className="lec-card-time">
        <Clock size={13} />
        <span>{l.time}</span>
      </div>
      <div className="lec-card-body">
        <div className="lec-card-tags">
          <span className="pill subject">{l.subjectName}</span>
          {l.tags.slice(0, 2).map(t => <span key={t} className="pill">{t}</span>)}
        </div>
        <h3 className="serif lec-card-title">{l.title}</h3>
        <p className="lec-card-blurb">{l.blurb}</p>
        <div className="lec-card-meta">
          <button className="lec-card-presenter" onClick={() => onPickTutor && onPickTutor(l.presenterId)}>
            <div className={`avatar sm ${l.presenterBg}`}>{l.presenterInit}</div>
            <span>{l.presenter}</span>
          </button>
          <span className="lec-card-dot">·</span>
          <span className="lec-card-loc"><Pin size={12} />{l.location}</span>
        </div>
      </div>
      <div className="lec-card-rsvp">
        <div className="lec-seats">
          <div className="lec-seats-bar">
            <div className="lec-seats-fill" style={{ width: `${pct}%`, background: nearlyFull ? 'var(--accent)' : 'var(--success)' }} />
          </div>
          <div className="lec-seats-label">
            <strong>{l.rsvp}</strong>/{l.capacity}
            {nearlyFull && <span className="lec-nearly"> · filling up</span>}
          </div>
        </div>
        <button className={`btn ${rsvped ? '' : 'primary'}`} onClick={onRsvp}>
          {rsvped ? <><Check size={13} /> Going</> : 'RSVP'}
        </button>
      </div>
    </article>
  );
}

export default function Lectures() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rsvps, toggleRsvp } = useAppData();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('upcoming');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [suggestSubject, setSuggestSubject] = useState('');
  const [suggestTopic, setSuggestTopic] = useState('');
  const [suggestDone, setSuggestDone] = useState(false);
  const [hostTitle, setHostTitle] = useState('');
  const [hostSubject, setHostSubject] = useState('');
  const [hostTime, setHostTime] = useState('');
  const [hostLocation, setHostLocation] = useState('Library Room 204');
  const [hostDone, setHostDone] = useState(false);

  const handleRsvp = (id) => {
    if (!user) { setShowAuthModal(true); return; }
    toggleRsvp(id);
  };

  const handlePickTutor = (id) => {
    if (!user) { setShowAuthModal(true); return; }
    navigate(`/tutor/${id}`);
  };

  const handleSuggest = (e) => {
    e.preventDefault();
    setSuggestDone(true);
    setTimeout(() => { setSuggestDone(false); setShowSuggestModal(false); setSuggestTopic(''); setSuggestSubject(''); }, 2000);
  };

  const handleHost = (e) => {
    e.preventDefault();
    setHostDone(true);
    setTimeout(() => { setHostDone(false); setShowHostModal(false); setHostTitle(''); setHostSubject(''); setHostTime(''); }, 2000);
  };

  const filtered = filter === 'all' ? PEER_LECTURES : PEER_LECTURES.filter(l => l.subject === filter);
  const featured = PEER_LECTURES.find(l => l.featured);
  const rest = filtered.filter(l => !l.featured || filter !== 'all');

  const grouped = [];
  const seen = {};
  rest.forEach(l => {
    if (!seen[l.dateKey]) {
      seen[l.dateKey] = { day: l.day, dom: l.dom, month: l.month, items: [] };
      grouped.push({ key: l.dateKey, ...seen[l.dateKey] });
    }
    seen[l.dateKey].items.push(l);
  });
  grouped.sort((a, b) => a.dom - b.dom);

  const totalRsvp = PEER_LECTURES.reduce((s, l) => s + l.rsvp, 0);

  return (
    <div className="lectures">
      {/* Auth gate modal */}
      {showAuthModal && (
        <Modal onClose={() => setShowAuthModal(false)}>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 8 }}>Sign in to RSVP</h3>
          <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 20 }}>
            You can browse all lectures without an account. To save a seat, sign in or create a free account.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn primary lg" style={{ flex: 1, justifyContent: 'center' }}>Sign in</Link>
            <Link to="/signup" className="btn lg" style={{ flex: 1, justifyContent: 'center' }}>Sign up free</Link>
          </div>
        </Modal>
      )}

      {/* Suggest a topic modal */}
      {showSuggestModal && (
        <Modal onClose={() => setShowSuggestModal(false)}>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 8 }}>Suggest a topic</h3>
          <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 20 }}>
            Got a topic you'd love to see covered? Suggest it and we'll find someone to host it.
          </p>
          <form onSubmit={handleSuggest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="field-label">Subject</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {SUBJECTS.map(s => (
                  <button key={s.id} type="button" className={`chip ${s.id} ${suggestSubject === s.id ? 'active' : ''}`} onClick={() => setSuggestSubject(s.id)}>
                    <span className="chip-dot" />{s.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label">Topic / question</label>
              <textarea
                className="input"
                style={{ height: 80, resize: 'vertical', marginTop: 6 }}
                placeholder="e.g. How do I actually understand equilibrium constants?"
                value={suggestTopic}
                onChange={e => setSuggestTopic(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn primary lg" style={{ justifyContent: 'center' }} disabled={!suggestTopic}>
              {suggestDone ? <><Check size={14} /> Sent!</> : 'Submit suggestion'}
            </button>
          </form>
        </Modal>
      )}

      {/* Host a lecture modal */}
      {showHostModal && (
        <Modal onClose={() => setShowHostModal(false)}>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 8 }}>Propose a lecture</h3>
          <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 20 }}>
            Pick a topic, a time, and a room. We'll handle the RSVPs and count it toward your service hours.
          </p>
          <form onSubmit={handleHost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="field-label">Title</label>
              <input className="input" style={{ marginTop: 6 }} placeholder="e.g. Stoichiometry shortcuts in 40 minutes" value={hostTitle} onChange={e => setHostTitle(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Subject</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {SUBJECTS.map(s => (
                  <button key={s.id} type="button" className={`chip ${s.id} ${hostSubject === s.id ? 'active' : ''}`} onClick={() => setHostSubject(s.id)}>
                    <span className="chip-dot" />{s.name}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="field-label">Preferred time</label>
                <input className="input" style={{ marginTop: 6 }} placeholder="e.g. Wed 4–5 PM" value={hostTime} onChange={e => setHostTime(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Location</label>
                <select className="input" style={{ marginTop: 6 }} value={hostLocation} onChange={e => setHostLocation(e.target.value)}>
                  <option>Library Room 204</option>
                  <option>Computer Lab (B-wing)</option>
                  <option>Physics Lab</option>
                  <option>Bio Lab 2</option>
                  <option>Chem Lab 3</option>
                  <option>Robotics Workshop</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn primary lg" style={{ justifyContent: 'center' }} disabled={!hostTitle || !hostSubject}>
              {hostDone ? <><Check size={14} /> Submitted!</> : 'Propose lecture'}
            </button>
          </form>
        </Modal>
      )}

      <div className="page-header">
        <div>
          <div className="eyebrow">RHNS · Term 2, 2026 · Week of May 19</div>
          <h1 className="page-title">Peer <em>lectures</em></h1>
          <p className="page-sub">Free deep-dives run by Year 11 tutors who just finished the topic. {!user && 'Browse freely — sign in to RSVP.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn" onClick={() => setShowSuggestModal(true)}>+ Suggest a topic</button>
          {user?.role === 'tutor' && (
            <button className="btn primary" onClick={() => setShowHostModal(true)}><Mic size={14} />Host a lecture</button>
          )}
          {!user && (
            <Link to="/login" className="btn primary">Sign in to RSVP</Link>
          )}
        </div>
      </div>

      {/* Guest banner */}
      {!user && (
        <div style={{ background: 'var(--bg-sunk)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
          <Bell size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ color: 'var(--fg-muted)' }}>
            You're viewing lectures as a guest.{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link> or{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 500 }}>create a free account</Link> to RSVP and save your seat.
          </span>
        </div>
      )}

      {/* Stat strip */}
      <div className="lec-strip">
        <div className="lec-strip-cell">
          <div className="v serif">{PEER_LECTURES.length}</div>
          <div className="k">lectures this week</div>
        </div>
        <div className="lec-strip-cell">
          <div className="v serif">{totalRsvp}</div>
          <div className="k">seats reserved</div>
        </div>
        <div className="lec-strip-cell">
          <div className="v serif">8</div>
          <div className="k">peer presenters</div>
        </div>
        <div className="lec-strip-cell">
          <div className="v serif">$0</div>
          <div className="k">always free</div>
        </div>
        <div className="lec-strip-cell push">
          <div className="lec-strip-now">
            <span className="lec-pulse" />
            <span>Next lecture starts in <strong>2h 14m</strong></span>
          </div>
        </div>
      </div>

      {/* Featured headline */}
      {featured && (
        <article className="lec-headline">
          <div className="lec-headline-side">
            <div className="lec-headline-pin">
              <Bell size={13} />
              <span>Headline this week</span>
            </div>
            <div className="lec-headline-date">
              <div className="dom serif">{featured.dom}</div>
              <div className="mo">
                <div className="month">{featured.month}</div>
                <div className="dow">{fullDayName(featured.day)}</div>
              </div>
            </div>
            <div className="lec-headline-time"><Clock size={14} /> {featured.time}</div>
            <div className="lec-headline-loc"><Pin size={14} /> {featured.location}</div>
          </div>
          <div className="lec-headline-body">
            <div className="lec-headline-tags">
              <span className="pill subject">{featured.subjectName}</span>
              {featured.tags.map(t => <span key={t} className="pill">{t}</span>)}
            </div>
            <h2 className="serif lec-headline-title">{featured.title}</h2>
            <p className="lec-headline-blurb">{featured.blurb}</p>
            <div className="lec-headline-foot">
              <button className="lec-presenter" onClick={() => handlePickTutor(featured.presenterId)}>
                <div className={`avatar ${featured.presenterBg}`}>{featured.presenterInit}</div>
                <div style={{ textAlign: 'left' }}>
                  <div className="lec-presenter-name">{featured.presenter}</div>
                  <div className="lec-presenter-meta">{featured.presenterMeta}</div>
                </div>
              </button>
              <div className="lec-headline-rsvp">
                <div className="lec-seats">
                  <div className="lec-seats-bar">
                    <div className="lec-seats-fill" style={{ width: `${(featured.rsvp / featured.capacity) * 100}%` }} />
                  </div>
                  <div className="lec-seats-label">
                    <strong>{featured.rsvp}</strong> of {featured.capacity} seats reserved
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="icon-btn" title="Save"><Bookmark size={15} /></button>
                  <button
                    className={`btn ${rsvps[featured.id] ? '' : 'primary'} lg`}
                    onClick={() => handleRsvp(featured.id)}
                  >
                    {rsvps[featured.id] ? <><Check size={14} /> You're in</> : <>RSVP — save my seat</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Filter bar */}
      <div className="lec-filterbar">
        <div className="lec-tabs">
          {[['upcoming', 'This week'], ['calendar', 'Next week'], ['past', 'Past lectures']].map(([v, label]) => (
            <button key={v} className={`lec-tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>{label}</button>
          ))}
        </div>
        <div className="chip-row">
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All topics</button>
          {SUBJECTS.map(s => (
            <button key={s.id} className={`chip ${s.id} ${filter === s.id ? 'active' : ''}`} onClick={() => setFilter(s.id)}>
              <span className="chip-dot" />{s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Day-grouped list */}
      <div className="lec-days">
        {grouped.length === 0 && (
          <div className="empty">
            No lectures matching that subject this week.{' '}
            <button className="btn" onClick={() => setShowSuggestModal(true)}>Suggest one →</button>
          </div>
        )}
        {grouped.map(d => (
          <div key={d.key} className="lec-day">
            <div className="lec-day-rail">
              <div className="lec-day-dom serif">{d.dom}</div>
              <div className="lec-day-dow">{d.day}</div>
              <div className="lec-day-mo">{d.month}</div>
              <div className="lec-day-count">{d.items.length} {d.items.length === 1 ? 'talk' : 'talks'}</div>
            </div>
            <div className="lec-day-list">
              {d.items.map(l => (
                <LectureCard
                  key={l.id}
                  lecture={l}
                  rsvped={!!rsvps[l.id]}
                  onRsvp={() => handleRsvp(l.id)}
                  onPickTutor={handlePickTutor}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Host CTA */}
      <div className="lec-host-cta">
        <div>
          <div className="eyebrow">For Year 11 tutors</div>
          <h3 className="serif">Know a topic cold? Host a 45-min lecture.</h3>
          <p>You pick the topic, the slot, and the room. peerhour handles the RSVPs and counts the hour toward your service-hour requirement.</p>
        </div>
        {user?.role === 'tutor' ? (
          <button className="btn primary lg" onClick={() => setShowHostModal(true)}><Mic size={14} />Propose a lecture</button>
        ) : user ? (
          <Link to="/browse" className="btn lg">Find a tutor instead</Link>
        ) : (
          <Link to="/login" className="btn primary lg"><Mic size={14} />Sign in to propose</Link>
        )}
      </div>
    </div>
  );
}
