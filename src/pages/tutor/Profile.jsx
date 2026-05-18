import { useState } from 'react';
import { useAuth } from '../../store/AuthContext.jsx';
import { TUTORS, SUBJECTS } from '../../data/index.js';
import { Check } from '../../components/ui/Icons.jsx';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function TutorProfileEdit() {
  const { user } = useAuth();
  const tutor = TUTORS.find(t => t.id === user?.tutorId) || TUTORS[0];
  const storageKey = `ph_profile_${tutor.id}`;

  const [saved, setSaved] = useState(false);
  const [bio, setBio] = useState(() => load(storageKey, {}).bio ?? tutor.bio);
  const [bio2, setBio2] = useState(() => load(storageKey, {}).bio2 ?? (tutor.bio2 || ''));
  const [units, setUnits] = useState(() => load(storageKey, {}).units ?? (tutor.favoriteUnits?.join(', ') || ''));
  const [langs, setLangs] = useState(() => load(storageKey, {}).langs ?? (tutor.languages?.join(', ') || ''));

  const handleSave = (e) => {
    e.preventDefault();
    save(storageKey, { bio, bio2, units, langs });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    const defaults = { bio: tutor.bio, bio2: tutor.bio2 || '', units: tutor.favoriteUnits?.join(', ') || '', langs: tutor.languages?.join(', ') || '' };
    setBio(defaults.bio);
    setBio2(defaults.bio2);
    setUnits(defaults.units);
    setLangs(defaults.langs);
    save(storageKey, defaults);
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
            value={units}
            onChange={e => setUnits(e.target.value)}
            placeholder="e.g. Series & sequences, Trig identities, Rotational dynamics"
          />
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>Comma-separated. Helps students find you for specific topics.</div>
        </div>

        <div>
          <label className="field-label">Languages spoken</label>
          <input
            className="input"
            value={langs}
            onChange={e => setLangs(e.target.value)}
            placeholder="e.g. English, Mandarin"
          />
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="submit" className="btn primary lg" style={{ gap: 8 }}>
            {saved ? <><Check size={15} /> Saved!</> : 'Save changes'}
          </button>
          <button type="button" className="btn lg" onClick={handleReset}>
            Reset to defaults
          </button>
        </div>
      </form>

      {saved && (
        <div className="toast">Profile updated ✓</div>
      )}
    </div>
  );
}
