import { useState } from 'react';
import { SUBJECTS, RECORDINGS } from '../../data/index.js';
import { useAuth } from '../../store/AuthContext.jsx';
import { TUTORS } from '../../data/index.js';
import { Upload, Play, Eye, Check } from '../../components/ui/Icons.jsx';

const LEVELS = ['Foundation', 'Intermediate', 'AP / Advanced'];

export default function UploadContent() {
  const { user } = useAuth();
  const tutor = TUTORS.find(t => t.id === user?.tutorId) || TUTORS[0];
  const myRecordings = RECORDINGS.filter(r => r.tutorId === tutor.id);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [subject, setSubject] = useState(tutor.subjects[0] || 'math');
  const [level, setLevel] = useState('Intermediate');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !desc) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setTitle(''); setDesc(''); }, 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">For tutors</div>
          <h1 className="page-title">Upload <em>content</em></h1>
          <p className="page-sub">Share your knowledge — recordings count toward service hours, same as a live session.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        {/* Upload form */}
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

          <div>
            <label className="field-label">Video file</label>
            <div className="upload-zone">
              <Upload size={32} style={{ color: 'var(--fg-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Drop a video file here or click to browse</p>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>MP4, MOV, or WebM · max 2 GB</p>
              <input type="file" accept="video/*" style={{ display: 'none' }} />
            </div>
          </div>

          <button type="submit" className="btn primary lg" style={{ justifyContent: 'center' }}>
            {submitted ? <><Check size={15} /> Submitted!</> : <><Upload size={15} /> Upload video</>}
          </button>
        </form>

        {/* My recordings */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Your recordings ({myRecordings.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myRecordings.length === 0 ? (
              <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No recordings yet. Upload your first lesson!</p>
            ) : (
              myRecordings.map(r => (
                <div key={r.id} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className={`chip ${r.subject}`} style={{ fontSize: 11 }}>
                      <span className="chip-dot" />{SUBJECTS.find(s => s.id === r.subject)?.name}
                    </span>
                    <span className="pill" style={{ fontSize: 11 }}>{r.level}</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{r.title}</h4>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--fg-muted)' }}>
                    <span><Play size={11} /> {r.duration}</span>
                    <span><Eye size={11} /> {r.views} views</span>
                    <span>{r.uploadedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {submitted && <div className="toast">Video submitted for review ✓</div>}
    </div>
  );
}
