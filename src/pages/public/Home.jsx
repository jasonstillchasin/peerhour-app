import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TUTORS } from '../../data/index.js';

// ── Drifting glyph background canvas ────────────────────────────────────────
const GLYPHS = ['∫', 'π', 'Σ', '∂', 'α', '∞', '√', '∆', '¶', 'λ', '{ }',
  'if', 'else', '⚗', 'DNA', 'mol', 'Ω', 'x²', 'sin', 'cos', 'log', '∮'];

function GlyphCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * DPR;
      canvas.height = canvas.offsetHeight * DPR;
      ctx.scale(DPR, DPR);
      particles = Array.from({ length: 22 }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.18,
        size: 14 + Math.random() * 30,
        op: 0.04 + Math.random() * 0.09,
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#14130f';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -60) p.x = w + 40;
        if (p.x > w + 60) p.x = -40;
        if (p.y < -60) p.y = h + 40;
        if (p.y > h + 60) p.y = -40;
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

  return (
    <canvas
      ref={ref}
      className="bg-canvas"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ── Scroll-triggered fade-up reveal ─────────────────────────────────────────
function Reveal({ children, as: Tag = 'div', className = '', stagger = false, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (stagger) {
    const arr = React.Children.toArray(children);
    return (
      <Tag ref={ref} className={className} style={style}>
        {arr.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                className: [child.props.className, 'reveal', visible ? '' : 'hidden'].filter(Boolean).join(' '),
                style: { ...(child.props.style || {}), transitionDelay: `${i * 0.09}s` },
              })
            : child
        )}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={['reveal', visible ? '' : 'hidden', className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}

// ── Count-up number animation ────────────────────────────────────────────────
function CountUp({ to, decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          obs.disconnect();
          const start = Date.now();
          const dur = 1400;
          const tick = () => {
            const t = Math.min(1, (Date.now() - start) / dur);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            setVal(ease * to);
            if (t < 1) requestAnimationFrame(tick);
            else setVal(to);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val.toFixed(decimals)}</span>;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const FEATURED = TUTORS.slice(0, 4);

const SUBJECTS_4 = [
  { name: 'Math',      icon: '∫',   bg: 'math-bg',    meta: 'Ext 1 & 2 Maths · Preliminary Maths · Linear algebra', count: 14 },
  { name: 'English',   icon: '¶',   bg: 'english-bg', meta: 'HSC English Advanced · Extension · Uni applications',   count: 9  },
  { name: 'Sciences',  icon: 'α',   bg: 'science-bg', meta: 'HSC Biology · Chemistry · Physics',                     count: 12 },
  { name: 'Computing', icon: '{ }', bg: 'cs-bg',      meta: 'SDD · Web · Python · Robotics',                         count: 7, mono: true },
];

const TITLE_WORDS = [
  { t: 'Stuck',    delay: 0.10 },
  { t: 'on',       delay: 0.18 },
  { t: 'chem?',    delay: 0.26, em: true },
  { t: 'A',        delay: 0.42 },
  { t: 'Year 11',  delay: 0.50, em: true },
  { t: 'who',      delay: 0.66 },
  { t: 'just',     delay: 0.74 },
  { t: 'finished', delay: 0.82 },
  { t: 'it',       delay: 0.90 },
  { t: 'has',      delay: 0.98 },
  { t: 'an',       delay: 1.06 },
  { t: 'hour.',    delay: 1.14 },
];

const HERO_CARDS = [
  { tutor: FEATURED[0], meta: 'Ext 2 Maths · free at 3:30 today', cls: 'hero-card-1' },
  { tutor: FEATURED[1], meta: 'SDD · free Wed 4pm',               cls: 'hero-card-2' },
  { tutor: FEATURED[2], meta: 'HSC English · 2 slots left',       cls: 'hero-card-3' },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    if (document.visibilityState === 'visible') {
      setAnimReady(true);
    } else {
      const handler = () => {
        if (document.visibilityState === 'visible') {
          document.removeEventListener('visibilitychange', handler);
          setAnimReady(true);
        }
      };
      document.addEventListener('visibilitychange', handler);
      return () => document.removeEventListener('visibilitychange', handler);
    }
  }, []);

  const anim = (delay) =>
    animReady ? { animation: `fadeUp 0.7s ${delay}s ease both` } : {};

  return (
    <div className={`home ${animReady ? 'anim-ready' : ''}`}>

      {/* ── Top nav ── */}
      <nav className="pub-nav">
        <div className="pub-nav-inner">
          <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--fg)', textDecoration: 'none', lineHeight: 1 }}>
            peer<em style={{ color: 'var(--accent)' }}>hour</em>
          </Link>
          <div className="pub-nav-links">
            <a href="#how">How it works</a>
            <a href="#tutors">Tutors</a>
            <a href="#subjects">Subjects</a>
            <a href="#faq">FAQ</a>
            <Link to="/lectures">Lectures</Link>
          </div>
          <div className="pub-nav-cta">
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
            <Link to="/signup" className="btn btn-primary">Find a tutor</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero">
        <GlyphCanvas />
        <div className="hero-glow" />

        <h1 className="hero-title">
          {TITLE_WORDS.map((p, i) => (
            <span key={i}>
              <span
                className="word"
                style={{
                  animationDelay: `${p.delay}s`,
                  ...(p.em ? { color: 'var(--accent)', fontStyle: 'italic' } : {}),
                }}
              >
                {p.t}
              </span>{' '}
            </span>
          ))}
        </h1>

        <p className="hero-lead" style={anim(1.3)}>
          peerhour is a free booking platform for Reddam House North Shore students.
          Browse Year 11 students who tutor in your subjects, pick a free slot
          on their calendar, and meet — in the library, the lab, or online.
        </p>

        <div className="hero-actions" style={anim(1.5)}>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Browse tutors →
          </Link>
          <Link to="/lectures" className="btn btn-lg">
            View lectures
          </Link>
        </div>

        <div className="hero-bar" style={anim(1.7)}>
          <div className="hero-stat-lg">
            <div className="v serif"><CountUp to={42} /></div>
            <div className="k">peer tutors</div>
          </div>
          <div className="hero-divider" />
          <div className="hero-stat-lg">
            <div className="v serif"><CountUp to={610} /></div>
            <div className="k">sessions taught</div>
          </div>
          <div className="hero-divider" />
          <div className="hero-stat-lg">
            <div className="v serif">
              <CountUp to={4.9} decimals={1} />
              <span style={{ fontSize: '0.52em', verticalAlign: 'middle', marginLeft: 2 }}>/5</span>
            </div>
            <div className="k">avg rating</div>
          </div>
          <div className="hero-divider" />
          <div className="hero-stat-lg">
            <div className="v serif">$0</div>
            <div className="k">always free</div>
          </div>
        </div>

        {/* Floating tutor cards */}
        <div className="hero-deck">
          {HERO_CARDS.map(({ tutor: t, meta, cls }) => (
            <div key={t.id} className={`hero-card ${cls}`}>
              <div className={`avatar avatar-sm ${t.avatarBg}`}>{t.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="hero-card-name">{t.name.split(' ')[0]}</div>
                <div className="hero-card-meta">{meta}</div>
              </div>
              <span className="pill pill-success">Open</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Subject marquee ── */}
      <div className="subject-marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map(k => (
            <span key={k} style={{ display: 'contents' }}>
              {['Ext 2 Maths', 'HSC Chemistry', 'Recursion & Big-O', 'HSC English Advanced',
                'Cellular Respiration', 'Rotational Dynamics', 'Uni Applications',
                'SDD · Python', 'Stoichiometry', 'Preliminary Maths', 'Genetics', 'Web Dev'].map(s => (
                <span key={s + k} className="marquee-item">{s}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="home-section" id="how">
        <Reveal>
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2 className="section-title">Three steps. No money changes hands.</h2>
          </div>
        </Reveal>
        <Reveal stagger className="step-grid">
          <div className="step">
            <div className="step-num">01</div>
            <h3>Find someone who gets it</h3>
            <p>Filter by subject or what unit you're stuck on. Every tutor has been through the same class — usually within the last year.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>Book a free slot</h3>
            <p>Tutors post their weekly availability. Tap a green slot, write what you want to work on, hit confirm. The whole thing takes 30 seconds.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>Show up. Get unstuck.</h3>
            <p>Meet in the library, the computer lab, or hop on a video call. After the session, leave a quick rating so future students know who's great at what.</p>
          </div>
        </Reveal>
      </section>

      {/* ── Subjects ── */}
      <section className="home-section sunk" id="subjects">
        <div className="inner">
          <Reveal>
            <div className="section-head">
              <div className="eyebrow">Subjects covered</div>
              <h2 className="section-title">From <em>factoring</em> to <em>recursion</em>.</h2>
              <p className="section-lead">
                Every HSC and elective track at RHNS has a tutor on the roster.
                If yours isn't listed, message us and we'll find someone.
              </p>
            </div>
          </Reveal>
          <Reveal stagger as="div" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {SUBJECTS_4.map(s => (
              <button
                key={s.name}
                className="subject-card"
                onClick={() => navigate('/signup')}
              >
                <div
                  className={`subject-icon ${s.bg}`}
                  style={s.mono ? { fontFamily: 'var(--font-mono)', fontSize: 22 } : {}}
                >
                  {s.icon}
                </div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-meta">{s.meta}</div>
                <div className="subject-count">{s.count} tutors</div>
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Featured tutors ── */}
      <section className="home-section" id="tutors">
        <Reveal>
          <div className="section-head row">
            <div>
              <div className="eyebrow">This week's tutors</div>
              <h2 className="section-title">Year 11 students. Same hallway. Real help.</h2>
            </div>
            <button className="btn" onClick={() => navigate('/signup')}>See all 42 →</button>
          </div>
        </Reveal>
        <Reveal stagger className="featured-grid">
          {FEATURED.map(t => (
            <button key={t.id} className="featured-card" onClick={() => navigate('/signup')}>
              <div className={`avatar avatar-lg ${t.avatarBg}`}>{t.initials}</div>
              <div className="featured-name serif">{t.name}</div>
              <div className="featured-meta">{t.year} · {t.major}</div>
              <div className="featured-quote">"{t.bio.split('.')[0]}."</div>
              <div className="featured-foot">
                <span className="pill pill-success">Open this week</span>
                <span className="rating-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)' }}>
                    <path d="m12 2 3 7 7 .5-5.5 4.5L18 22l-6-4-6 4 1.5-8L2 9.5 9 9z"/>
                  </svg>
                  {t.rating}
                </span>
              </div>
            </button>
          ))}
        </Reveal>
      </section>

      {/* ── Testimonial ── */}
      <Reveal as="section" className="home-quote">
        <div className="quote-mark serif">"</div>
        <blockquote className="serif">
          I went from a C+ to an A- in HSC Biology in one term.
          Amira just explained pathways in a way my teacher never did —
          probably because she'd memorised the same flashcards six months earlier.
        </blockquote>
        <div className="quote-attr">
          <div className="avatar avatar-sm bg-3">DK</div>
          <div>
            <div className="quote-name">Devi K. · Year 10</div>
            <div className="quote-meta">8 sessions with Amira H.</div>
          </div>
        </div>
      </Reveal>

      {/* ── For tutors ── */}
      <section className="home-section">
        <Reveal className="cta-section">
          <div>
            <div className="eyebrow">For Year 11 students</div>
            <h2 className="section-title">Tutoring counts. <em>Literally.</em></h2>
            <p className="section-lead">
              Every hour you tutor through peerhour is verified and logged toward your
              service-hour requirement. You set your own schedule, pick the subjects
              you actually want to teach, and meet students who genuinely want to be there.
            </p>
            <ul className="bullet-list">
              <li>Service-hour credit, auto-tracked</li>
              <li>Strong references for uni applications</li>
              <li>Set availability in 60 seconds — change it anytime</li>
              <li>Reviewed and approved by the head of enrichment</li>
            </ul>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ marginTop: 20, display: 'inline-flex' }}>
              Apply to tutor →
            </Link>
          </div>
          <div className="badge-card">
            <div className="badge-card-eyebrow">This term, peer tutors at RHNS logged</div>
            <div className="badge-card-num serif"><CountUp to={1840} /></div>
            <div className="badge-card-unit">service hours</div>
            <div className="badge-card-foot">
              <span>Across 42 active tutors</span>
              <span>·</span>
              <span>Avg. 44 hrs / tutor</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="home-section" id="faq">
        <Reveal>
          <div className="section-head">
            <div className="eyebrow">Quick answers</div>
            <h2 className="section-title">Things people ask.</h2>
          </div>
        </Reveal>
        <Reveal className="faq-list">
          <details className="faq" open>
            <summary>Is peerhour really free?</summary>
            <p>Yes. Always. Peer tutoring is funded as part of RHNS's enrichment program — tutors earn service hours, not money. No transactions, no awkward asks.</p>
          </details>
          <details className="faq">
            <summary>Who can become a tutor?</summary>
            <p>Any Year 11 student in good academic standing. You apply through your school account, list the courses you've completed with a B or higher, and the enrichment team does a quick review. Most applications are approved within 48 hours.</p>
          </details>
          <details className="faq">
            <summary>Where do sessions happen?</summary>
            <p>Library Room 204 is reserved for peerhour every weekday after school. You can also book the computer lab (good for computing sessions) or meet online via video call if you're sick or stuck at home.</p>
          </details>
          <details className="faq">
            <summary>What if I need to cancel?</summary>
            <p>Cancel up to two hours before the session, no questions asked. Repeated last-minute cancellations affect your priority booking, so be cool to your tutor.</p>
          </details>
          <details className="faq">
            <summary>Can I rebook the same tutor every week?</summary>
            <p>Absolutely — and most students do. There's no limit on how many sessions you can book.</p>
          </details>
          <details className="faq">
            <summary>Do I need to sign in to view lectures?</summary>
            <p>No — you can browse all upcoming peer lectures without an account. You'll just need to sign in to RSVP and save a seat.</p>
          </details>
        </Reveal>
      </section>

      {/* ── Footer CTA ── */}
      <Reveal as="section" className="footer-cta">
        <h2 className="serif">Got a test on Friday?</h2>
        <p>Most peer tutors have an open slot in the next 48 hours.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary btn-lg">Find a tutor now →</Link>
        </div>
      </Reveal>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div>peerhour · made by students, for students · Reddam House North Shore</div>
        <div className="footer-links">
          <a href="#">RHNS</a>
          <a href="#">Contact enrichment</a>
          <a href="#">Tutor handbook</a>
          <a href="#">Privacy</a>
        </div>
      </footer>

    </div>
  );
}
