import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TUTORS, SUBJECTS } from '../../data/index.js';
import { Search, Star, ChevronRight } from '../../components/ui/Icons.jsx';

const GRADES = ['All years', 'Junior', 'Senior'];

export default function Browse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState(params.get('subject') || 'all');
  const [grade, setGrade] = useState('All years');

  const filtered = useMemo(() => {
    return TUTORS.filter(t => {
      const matchSubject = subject === 'all' || t.subjects.includes(subject);
      const matchGrade = grade === 'All years' || t.year === grade;
      const q = query.toLowerCase();
      const matchQuery = !q ||
        t.name.toLowerCase().includes(q) ||
        t.subjects.some(s => s.includes(q)) ||
        t.major.toLowerCase().includes(q);
      return matchSubject && matchGrade && matchQuery;
    });
  }, [query, subject, grade]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Wakefield High · {TUTORS.length} tutors</div>
          <h1 className="page-title">Find a <em>tutor</em></h1>
          <p className="page-sub">Senior students ready to help — every session is free.</p>
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="input-icon" />
          <input
            className="input"
            placeholder="Search by name, subject, or topic…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="chip-row" style={{ flexWrap: 'wrap' }}>
          <button
            className={`chip ${subject === 'all' ? 'active' : ''}`}
            onClick={() => setSubject('all')}
          >
            All subjects
          </button>
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              className={`chip ${s.id} ${subject === s.id ? 'active' : ''}`}
              onClick={() => setSubject(s.id)}
            >
              <span className="chip-dot" />{s.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {GRADES.map(g => (
            <button
              key={g}
              className={`chip ${grade === g ? 'active' : ''}`}
              onClick={() => setGrade(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-muted)' }}>
          No tutors match that filter. <button className="btn" onClick={() => { setQuery(''); setSubject('all'); setGrade('All years'); }}>Clear filters</button>
        </div>
      )}

      <div className="tutor-grid">
        {filtered.map(t => (
          <article
            key={t.id}
            className="tutor-card"
            onClick={() => navigate(`/tutor/${t.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="tutor-card-head">
              <div className={`avatar lg ${t.avatarBg}`}>{t.initials}</div>
              <div className="tutor-card-info">
                <h3 className="tutor-name">{t.name}</h3>
                <div className="tutor-meta">{t.year} · {t.major}</div>
              </div>
            </div>

            <div className="tutor-subjects">
              {t.subjects.map(s => (
                <span key={s} className={`chip ${s}`}>
                  <span className="chip-dot" />
                  {SUBJECTS.find(sub => sub.id === s)?.name}
                </span>
              ))}
            </div>

            <p className="tutor-bio">{t.bio}</p>

            <div className="tutor-card-foot">
              <div className="tutor-stats">
                <Star size={13} style={{ color: 'var(--accent)' }} />
                <span>{t.rating}</span>
                <span className="tutor-stat-dot">·</span>
                <span>{t.sessionsCount} sessions</span>
              </div>
              <div className="tutor-next">
                <span className="tutor-next-dot" />
                {t.nextSlot}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
