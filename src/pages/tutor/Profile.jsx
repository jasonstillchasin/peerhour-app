import { useState } from 'react';
import { useAuth } from '../../store/AuthContext.jsx';
import { TUTORS, SUBJECTS } from '../../data/index.js';
import { Check } from '../../components/ui/Icons.jsx';

export default function TutorProfileEdit() {
  const { user } = useAuth();
  const tutor = TUTORS.find(t => t.id === user?.tutorId) || TUTORS[0];
  const [saved, setSaved] = useState(false);
  const [bio, setBio] = useState(tutor.bio);
  const [bio2, setBio2] = useState(tutor.bio2 || '');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">Tutor settings</div>
          <h1 className="page-title">Your <em>profile</em></h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, padding: 20, background: 'var(--bg-elev)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div className={`avatar xl ${tutor.avatarBg}`}>{tutor.initials}</div>
        <div>
          <h2 className="serif" style={{ fontSize: 28, marginBottom: 4 }}>{tutor.name}</h2>
          <div style={{ color: 'var(--fg-muted)', fontSize: 14 }}>{tutor.year} · {tutor.major}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {tutor.subjects.map(s => (
              <span key={s} className={`chip ${s}`}><span className="chip-dot" />{SUBJECTS.find(sub => sub.id === s)?.name}</span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="field-label">Bio — first impression</label>
          <textarea
            className="input"
            style={{ height: 100, resize: 'vertical' }}
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>Shown on your profile card and in search results.</div>
        </div>

        <div>
          <label className="field-label">Bio — teaching style</label>
          <textarea
            className="input"
            style={{ height: 100, resize: 'vertical' }}
            value={bio2}
            onChange={e => setBio2(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Favourite units / topics</label>
          <input
            className="input"
            defaultValue={tutor.favoriteUnits?.join(', ')}
            placeholder="e.g. Series & sequences, Trig identities, Rotational dynamics"
          />
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>Comma-separated. Helps students find you for specific topics.</div>
        </div>

        <div>
          <label className="field-label">Languages spoken</label>
          <input
            className="input"
            defaultValue={tutor.languages?.join(', ')}
            placeholder="e.g. English, Spanish"
          />
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="submit" className="btn primary lg" style={{ gap: 8 }}>
            {saved ? <><Check size={15} /> Saved!</> : 'Save changes'}
          </button>
          <button type="button" className="btn lg" onClick={() => { setBio(tutor.bio); setBio2(tutor.bio2 || ''); }}>
            Reset
          </button>
        </div>
      </form>

      {saved && (
        <div className="toast">Profile updated ✓</div>
      )}
    </div>
  );
}
