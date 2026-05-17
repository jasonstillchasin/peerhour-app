import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TUTORS, SUBJECTS } from '../../data/index.js';
import { Star, BookOpen, Video, ArrowRight } from '../../components/ui/Icons.jsx';

const GLYPHS = ['∫', 'π', 'α', 'Σ', '∆', 'λ', 'sin', 'log', '⚗', 'DNA', '{ }', '¶', 'θ', 'F⃗'];

function GlyphCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      size: 16 + Math.random() * 28,
      op: 0.04 + Math.random() * 0.1,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#14130f';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -60) p.x = canvas.width + 40;
        if (p.x > canvas.width + 60) p.x = -40;
        if (p.y < -60) p.y = canvas.height + 40;
        if (p.y > canvas.height + 60) p.y = -40;
        ctx.save();
        ctx.globalAlpha = p.op;
        ctx.fillStyle = fg;
        ctx.font = `${p.size}px "Instrument Serif", serif`;
        ctx.fillText(p.g, p.x, p.y);
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

const STEPS = [
  { n: '01', title: 'Browse tutors', desc: 'Filter by subject, year, or next-available slot. Every tutor is a current senior with a proven track record.' },
  { n: '02', title: 'Pick a time', desc: 'Tap any green slot on their weekly calendar. 1-hour sessions, no back-and-forth scheduling.' },
  { n: '03', title: 'Show up & learn', desc: "Library, computer lab, or online — you choose. It's free, always." },
];

const STATS = [
  { v: 42, label: 'peer tutors' },
  { v: 610, label: 'sessions this year' },
  { v: '4.9', label: 'avg rating' },
  { v: '$0', label: 'always free' },
];

const FEATURED_TUTORS = TUTORS.slice(0, 4);

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '80px 0 64px' }}>
        <GlyphCanvas />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <div className="pill" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="lec-pulse" style={{ width: 7, height: 7 }} />
            Wakefield High · Spring '26 cohort live
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(52px,6vw,88px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: 24 }}>
            Ace it —<br />with a tutor<br />who just did.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--fg-muted)', maxWidth: '44ch', lineHeight: 1.55, marginBottom: 36 }}>
            Senior students at Wakefield run free 1-on-1 tutoring sessions, peer lectures, and video lessons. No fees. No pressure.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn primary lg" onClick={() => navigate('/signup')}>
              Get started free <ArrowRight size={16} />
            </button>
            <button className="btn lg" onClick={() => navigate('/login')}>
              Sign in →
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid var(--fg)', borderBottom: '1px solid var(--border)', margin: '0 0 72px' }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div className="serif" style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.v}</div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Subjects */}
      <section style={{ marginBottom: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>What we cover</div>
        <div className="subject-grid">
          {SUBJECTS.map(s => {
            const count = s.tutorCount || TUTORS.filter(t => t.subjects.includes(s.id)).length;
            return (
              <button
                key={s.id}
                className="subject-card"
                onClick={() => navigate('/signup')}
              >
                <div className={`subject-icon ${s.bg}`} style={s.iconMono ? { fontFamily: 'var(--font-mono)', fontSize: 22 } : {}}>
                  {s.icon}
                </div>
                <div className="subject-name serif">{s.name}</div>
                <div className="subject-meta">{s.desc}</div>
                <div className="subject-count">{count} tutor{count !== 1 ? 's' : ''}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section style={{ marginBottom: 72 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>How it works</div>
        <div className="step-grid">
          {STEPS.map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num serif">{s.n}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured tutors */}
      <section style={{ marginBottom: 72 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <div className="eyebrow">Featured tutors</div>
          <button className="btn" style={{ fontSize: 13 }} onClick={() => navigate('/signup')}>
            See all →
          </button>
        </div>
        <div className="featured-grid">
          {FEATURED_TUTORS.map(t => (
            <button
              key={t.id}
              className="featured-card"
              onClick={() => navigate('/signup')}
            >
              <div className={`avatar lg ${t.avatarBg}`}>{t.initials}</div>
              <h3 className="featured-name serif">{t.name}</h3>
              <div className="featured-major">{t.major}</div>
              <div className="featured-subjects">
                {t.subjects.map(s => (
                  <span key={s} className={`chip ${s} active`} style={{ fontSize: 11 }}>
                    <span className="chip-dot" />{SUBJECTS.find(sub => sub.id === s)?.name}
                  </span>
                ))}
              </div>
              <p className="featured-quote">"{t.bio.slice(0, 80)}…"</p>
              <div className="featured-stats">
                <Star size={12} style={{ color: 'var(--accent)' }} />
                <span>{t.rating}</span>
                <span style={{ color: 'var(--fg-soft)' }}>·</span>
                <span>{t.sessionsCount} sessions</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Explore more */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 72 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/signup')}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--accent-wash)', display: 'grid', placeItems: 'center' }}>
              <BookOpen size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="eyebrow">New</div>
              <h3 className="serif" style={{ fontSize: 20, marginTop: 2 }}>Peer lectures</h3>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>Free 45-min deep-dives. RSVP to save a seat.</p>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/signup')}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--accent-wash)', display: 'grid', placeItems: 'center' }}>
              <Video size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="eyebrow">On-demand</div>
              <h3 className="serif" style={{ fontSize: 20, marginTop: 2 }}>Video lessons</h3>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>Short recordings by tutors. Watch any time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-section" style={{ marginBottom: 72 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 'clamp(28px,3vw,42px)', lineHeight: 1.1, letterSpacing: '-0.015em', marginBottom: 12 }}>
            Ready to stop being stuck?
          </h2>
          <p style={{ color: 'var(--fg-muted)', maxWidth: '52ch', lineHeight: 1.6 }}>
            Create a free account and book your first session in under two minutes.
          </p>
        </div>
        <button className="btn primary lg" onClick={() => navigate('/signup')}>
          Get started free <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
