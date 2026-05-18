import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VIDEOS, SUBJECTS } from '../../data/index.js';
import { useAuth } from '../../store/AuthContext.jsx';
import { useAppData } from '../../store/AppDataContext.jsx';
import { Play, Eye, Bookmark, Plus, X } from '../../components/ui/Icons.jsx';

function fmtViews(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
}

function Modal({ onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div ref={ref} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, maxWidth: 560, width: '100%', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4 }}>
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function Videos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedVideos, toggleSavedVideo } = useAppData();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [now, setNow] = useState(VIDEOS.find(v => v.featured) || VIDEOS[0]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const toggleSave = (id, e) => {
    e?.stopPropagation();
    toggleSavedVideo(id);
  };

  let list = filter === 'all' ? VIDEOS : VIDEOS.filter(v => v.subject === filter);
  if (sort === 'popular') list = [...list].sort((a, b) => b.views - a.views);

  const upNext = VIDEOS.filter(v => v.id !== now.id && v.subject === now.subject).slice(0, 3);
  if (upNext.length < 3) {
    const others = VIDEOS.filter(v => v.id !== now.id && !upNext.includes(v));
    upNext.push(...others.slice(0, 3 - upNext.length));
  }

  const totalMinutes = VIDEOS.reduce((s, v) => {
    const [m, sec] = v.duration.split(':').map(Number);
    return s + m + sec / 60;
  }, 0);

  const savedList = VIDEOS.filter(v => savedVideos[v.id]);

  const handleRecord = () => {
    if (user?.role === 'tutor') {
      navigate('/tutor/upload');
    }
  };

  return (
    <div className="vids">
      {/* My library modal */}
      {showLibrary && (
        <Modal onClose={() => setShowLibrary(false)}>
          <h3 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>My library</h3>
          {savedList.length === 0 ? (
            <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No saved videos yet. Click the bookmark icon on any video to save it here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedList.map(v => (
                <button
                  key={v.id}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => { setNow(v); setShowLibrary(false); }}
                >
                  <div className={`vid-upnext-thumb ${v.glyphBg}`} style={{ width: 48, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 18, flexShrink: 0 }}>
                    {v.glyph}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{v.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{v.presenter} · {v.duration}</div>
                  </div>
                  <button
                    className="btn"
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={e => { e.stopPropagation(); toggleSave(v.id); }}
                  >
                    Remove
                  </button>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Video player modal */}
      {showPlayer && (
        <Modal onClose={() => setShowPlayer(false)}>
          <h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>{now.title}</h3>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 8, overflow: 'hidden' }}>
            <iframe
              src={now.videoUrl}
              title={now.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-muted)' }}>{now.presenter} · {now.subjectName} · {now.duration}</div>
        </Modal>
      )}

      <div className="page-header">
        <div>
          <div className="eyebrow">On-demand · always available</div>
          <h1 className="page-title">Peer <em>lessons</em></h1>
          <p className="page-sub">Short video lessons recorded by tutors. Watch any time — and when you want to dig deeper, book the tutor who made it.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn" onClick={() => setShowLibrary(true)}>
            <Bookmark size={14} />My library {savedList.length > 0 && `(${savedList.length})`}
          </button>
          {user?.role === 'tutor' && (
            <button className="btn primary" onClick={handleRecord}><Plus size={14} />Record a lesson</button>
          )}
        </div>
      </div>

      {/* Now-playing hero */}
      <section className="vid-hero">
        <div className={`vid-hero-thumb ${now.glyphBg}`}>
          <div className="vid-hero-glyph serif">{now.glyph}</div>
          <button className="vid-play-btn" aria-label="Play" onClick={() => setShowPlayer(true)}>
            <Play size={28} />
          </button>
          <div className="vid-hero-progress">
            <div className="vid-hero-progress-fill" style={{ width: '34%' }} />
          </div>
          <div className="vid-hero-timestamps">
            <span>04:18</span>
            <span>{now.duration}</span>
          </div>
        </div>

        <div className="vid-hero-info">
          <div className="vid-hero-tags">
            <span className="pill subject">{now.subjectName}</span>
            <span className="pill"><Eye size={12} /> {fmtViews(now.views)} views</span>
            <span className="pill">{now.postedAgo}</span>
          </div>
          <h2 className="serif vid-hero-title">{now.title}</h2>
          <p className="vid-hero-blurb">{now.blurb}</p>
          <button
            className="vid-hero-presenter"
            onClick={() => navigate(`/tutor/${now.presenterId}`)}
          >
            <div className={`avatar ${now.presenterBg}`}>{now.presenterInit}</div>
            <div>
              <div className="vid-presenter-name">{now.presenter}</div>
              <div className="vid-presenter-meta">Tap to view profile · book a session</div>
            </div>
          </button>
          <div className="vid-hero-actions">
            <button className="btn primary" onClick={() => setShowPlayer(true)}><Play size={14} />Watch now</button>
            <button
              className={`btn ${savedVideos[now.id] ? 'accent' : ''}`}
              onClick={e => toggleSave(now.id, e)}
            >
              <Bookmark size={14} />{savedVideos[now.id] ? 'Saved' : 'Save'}
            </button>
            <button className="btn" onClick={() => navigate(`/tutor/${now.presenterId}`)}>Book the tutor</button>
          </div>
        </div>

        <aside className="vid-upnext">
          <div className="vid-upnext-head">
            <div className="eyebrow" style={{ fontSize: 10 }}>Up next in {now.subjectName}</div>
          </div>
          <div className="vid-upnext-list">
            {upNext.map(v => (
              <button key={v.id} className="vid-upnext-row" onClick={() => setNow(v)}>
                <div className={`vid-upnext-thumb ${v.glyphBg}`}>
                  <span className="serif">{v.glyph}</span>
                  <span className="vid-mini-dur">{v.duration}</span>
                </div>
                <div className="vid-upnext-info">
                  <div className="vid-upnext-title">{v.title}</div>
                  <div className="vid-upnext-meta">{v.presenter} · {fmtViews(v.views)} views</div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </section>

      {/* Filter bar */}
      <div className="vid-filterbar">
        <div className="vid-tally">
          <span className="serif vid-tally-num">{VIDEOS.length}</span> lessons
          <span className="vid-tally-dot">·</span>
          <span className="serif vid-tally-num">{Math.round(totalMinutes)}</span> min total
        </div>
        <div className="chip-row" style={{ flex: 1 }}>
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All subjects</button>
          {SUBJECTS.map(s => (
            <button key={s.id} className={`chip ${s.id} ${filter === s.id ? 'active' : ''}`} onClick={() => setFilter(s.id)}>
              <span className="chip-dot" />{s.name}
            </button>
          ))}
        </div>
        <div className="vid-sort">
          <button className={`vid-sort-btn ${sort === 'recent' ? 'active' : ''}`} onClick={() => setSort('recent')}>Newest</button>
          <button className={`vid-sort-btn ${sort === 'popular' ? 'active' : ''}`} onClick={() => setSort('popular')}>Most watched</button>
        </div>
      </div>

      {/* Grid */}
      <div className="vid-grid">
        {list.map(v => (
          <article
            key={v.id}
            className={`vid-card ${v.id === now.id ? 'playing' : ''}`}
            onClick={() => setNow(v)}
          >
            <div className={`vid-thumb ${v.glyphBg}`}>
              <div className="vid-thumb-glyph serif">{v.glyph}</div>
              <div className="vid-thumb-play" onClick={e => { e.stopPropagation(); setNow(v); setShowPlayer(true); }}><Play size={16} /></div>
              <div className="vid-thumb-duration">{v.duration}</div>
              {v.id === now.id && <div className="vid-thumb-now">▸ playing</div>}
              <button
                className={`vid-thumb-save ${savedVideos[v.id] ? 'on' : ''}`}
                onClick={e => toggleSave(v.id, e)}
                aria-label="Save"
              >
                <Bookmark size={13} />
              </button>
            </div>
            <div className="vid-card-body">
              <div className="vid-card-sub">{v.subjectName}</div>
              <h3 className="serif vid-card-title">{v.title}</h3>
              <div className="vid-card-meta">
                <div className={`avatar sm ${v.presenterBg}`}>{v.presenterInit}</div>
                <span>{v.presenter}</span>
              </div>
              <div className="vid-card-foot">
                <span><Eye size={11} /> {fmtViews(v.views)}</span>
                <span className="vid-card-dot">·</span>
                <span>{v.postedAgo}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Record CTA */}
      <div className="vid-record-cta">
        <div className="vid-record-art">
          <span className="serif">▶</span>
        </div>
        <div>
          <div className="eyebrow">For Year 11 tutors</div>
          <h3 className="serif">Record a 10-min lesson. Reach the whole school.</h3>
          <p>One short video can save you a dozen 1-on-1 sessions answering the same question. Every video counts toward service hours, same as a live session.</p>
        </div>
        {user?.role === 'tutor' ? (
          <button className="btn primary lg" onClick={handleRecord}><Plus size={14} />Start recording</button>
        ) : (
          <button className="btn lg" disabled>Tutors only</button>
        )}
      </div>
    </div>
  );
}
