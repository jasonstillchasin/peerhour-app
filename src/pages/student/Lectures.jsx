import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PEER_LECTURES, SUBJECTS } from '../../data/index.js';
import { Bell, Clock, Pin, Check, Mic, Bookmark } from '../../components/ui/Icons.jsx';

function fullDayName(abbr) {
  return { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }[abbr] || abbr;
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
          <button
            className="lec-card-presenter"
            onClick={() => onPickTutor && onPickTutor(l.presenterId)}
          >
            <div className={`avatar sm ${l.presenterBg}`}>{l.presenterInit}</div>
            <span>{l.presenter}</span>
          </button>
          <span className="lec-card-dot">·</span>
          <span className="lec-card-loc">
            <Pin size={12} />{l.location}
          </span>
        </div>
      </div>
      <div className="lec-card-rsvp">
        <div className="lec-seats">
          <div className="lec-seats-bar">
            <div
              className="lec-seats-fill"
              style={{ width: `${pct}%`, background: nearlyFull ? 'var(--accent)' : 'var(--success)' }}
            />
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
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('upcoming');
  const [rsvp, setRsvp] = useState({ L1: true });

  const toggleRsvp = id => setRsvp(r => ({ ...r, [id]: !r[id] }));

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
      <div className="page-header">
        <div>
          <div className="eyebrow">Wakefield · Spring '26 · Week of May 19</div>
          <h1 className="page-title">Peer <em>lectures</em></h1>
          <p className="page-sub">Free 45-minute deep-dives, run by the tutors who just finished the class. RSVP to save a seat — most fill up by Wednesday.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn">+ Suggest a topic</button>
          <button className="btn primary"><Mic size={14} />Host a lecture</button>
        </div>
      </div>

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
            <div className="lec-headline-time">
              <Clock size={14} /> {featured.time}
            </div>
            <div className="lec-headline-loc">
              <Pin size={14} /> {featured.location}
            </div>
          </div>
          <div className="lec-headline-body">
            <div className="lec-headline-tags">
              <span className="pill subject">{featured.subjectName}</span>
              {featured.tags.map(t => <span key={t} className="pill">{t}</span>)}
            </div>
            <h2 className="serif lec-headline-title">{featured.title}</h2>
            <p className="lec-headline-blurb">{featured.blurb}</p>
            <div className="lec-headline-foot">
              <button
                className="lec-presenter"
                onClick={() => navigate(`/tutor/${featured.presenterId}`)}
              >
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
                    className={`btn ${rsvp[featured.id] ? '' : 'primary'} lg`}
                    onClick={() => toggleRsvp(featured.id)}
                  >
                    {rsvp[featured.id] ? <><Check size={14} /> You're in</> : <>RSVP — save my seat</>}
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
            <button key={v} className={`lec-tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
              {label}
            </button>
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
          <div className="empty">No lectures matching that subject this week. Suggest one →</div>
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
                  rsvped={!!rsvp[l.id]}
                  onRsvp={() => toggleRsvp(l.id)}
                  onPickTutor={id => navigate(`/tutor/${id}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Host CTA */}
      <div className="lec-host-cta">
        <div>
          <div className="eyebrow">For tutors</div>
          <h3 className="serif">Know a topic cold? Host a 45-min lecture.</h3>
          <p>You pick the topic, the slot, and the room. peerhour handles the RSVPs and counts the hour toward your service-hour requirement.</p>
        </div>
        <button className="btn primary lg"><Mic size={14} />Propose a lecture</button>
      </div>
    </div>
  );
}
