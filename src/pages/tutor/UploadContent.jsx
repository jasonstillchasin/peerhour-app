import { useState } from 'react';
import { SUBJECTS, RECORDINGS } from '../../data/index.js';
import { useAuth } from '../../store/AuthContext.jsx';
import { useAppData } from '../../store/AppDataContext.jsx';
import { TUTORS } from '../../data/index.js';
import { Play, Eye, Check, ExternalLink } from '../../components/ui/Icons.jsx';

const LEVELS = ['Foundation', 'Intermediate', 'HSC / Advanced'];

function extractYouTubeId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || '';
  } catch { return ''; }
  return '';
}

function isValidYouTubeUrl(url) {
  return !!extractYouTubeId(url);
}

export default function UploadContent() {
  const { user } = useAuth();
  const { uploads, addUpload } = useAppData();
  const tutor = TUTORS.find(t => t.id === user?.tutorId) || TUTORS[0];
  const myRecordings = [
    ...RECORDINGS.filter(r => r.presenterId === tutor.id),
    ...uploads.filter(u => u.tutorId === tutor.id),
  ];

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [subject, setSubject] = useState(tutor.subjects[0] || 'math');
  const [level, setLevel] = useState('Intermediate');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setYoutubeUrl(val);
    if (val && !isValidYouTubeUrl(val)) {
      setUrlError('Paste a YouTube link — youtube.com/watch?v=... or youtu.be/...');
    } else {
      setUrlError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !desc || !isValidYouTubeUrl(youtubeUrl)) return;
    const videoId = extractYouTubeId(youtubeUrl);
    addUpload({
      tutorId: tutor.id,
      title,
      description: desc,
      subject,
      level,
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      youtubeUrl: youtubeUrl.trim(),
      duration: '—',
    });
    setSubmitted(true);
    setTitle('');
    setDesc('');
    setYoutubeUrl('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const canSubmit = title && desc && isValidYouTubeUrl(youtubeUrl);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">For tutors</div>
          <h1 className="page-title">Share a <em>recording</em></h1>
          <p className="page-sub">Upload to YouTube (unlisted or private) and paste the link here. Recordings count toward service hours.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="field-label">Video title</label>
            <input
              className="input"
              placeholder="e.g. Series convergence in 12 minutes"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea
              className="input"
              style={{ height: 100, resize: 'vertical' }}
              placeholder="What will students learn? What prerequisite knowledge helps?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">YouTube link</label>
            <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 8 }}>
              Upload to YouTube first (set visibility to Unlisted so only students with the link can view it), then paste the link below.
            </p>
            <input
              className="input"
              placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={handleUrlChange}
              required
            />
            {urlError && (
              <p style={{ fontSize: 13, color: 'var(--danger, #c0392b)', marginTop: 6 }}>{urlError}</p>
            )}
            {isValidYouTubeUrl(youtubeUrl) && (
              <p style={{ fontSize: 12, color: 'var(--success, #27ae60)', marginTop: 6 }}>✓ Valid YouTube link</p>
            )}
          </div>

          <div>
            <label className="field-label">Subject</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip ${s.id} ${subject === s.id ? 'active' : ''}`}
                  onClick={() => setSubject(s.id)}
                >
                  <span className="chip-dot" />{s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Level</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {LEVELS.map(l => (
                <button
                  key={l}
                  type="button"
                  className={`chip ${level === l ? 'active' : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn primary lg" style={{ justifyContent: 'center' }} disabled={!canSubmit}>
            {submitted ? <><Check size={15} /> Added!</> : 'Add recording'}
          </button>
        </form>

        {/* My recordings */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Your recordings ({myRecordings.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myRecordings.length === 0 ? (
              <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No recordings yet. Add your first!</p>
            ) : (
              myRecordings.map(r => (
                <div key={r.id} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className={`chip ${r.subject}`} style={{ fontSize: 11 }}>
                      <span className="chip-dot" />{SUBJECTS.find(s => s.id === r.subject)?.name}
                    </span>
                    <span className="pill" style={{ fontSize: 11 }}>{r.level || '—'}</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{r.title}</h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--fg-muted)', alignItems: 'center' }}>
                    <span><Play size={11} /> {r.duration || '—'}</span>
                    <span><Eye size={11} /> {r.views ?? 0} views</span>
                    {(r.youtubeUrl || r.videoUrl) && (
                      <a
                        href={r.youtubeUrl || r.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={11} /> Watch
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
