import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { MOCK_USERS } from '../../data/index.js';
import { ArrowLeft } from '../../components/ui/Icons.jsx';

function isSafeEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes('?') && !email.includes('&');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

export default function StudentProfile() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentEmail = decodeURIComponent(studentId || '');
  const nameFromUrl = decodeURIComponent(searchParams.get('name') || '');

  const student = MOCK_USERS.find(u => u.email === studentEmail);
  const displayName = student?.name || nameFromUrl || studentEmail;
  const initials = student?.initials
    || displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarColor = student?.avatarColor || 'avatar-c1';

  const tutorId = user?.tutorId || user?.id;
  const tutorName = user?.name || tutorId;

  // All notes keyed by tutorId → { note, tutorName, updatedAt }
  const [allNotes, setAllNotes] = useState({});
  const [myNote, setMyNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!studentEmail) { setLoading(false); return; }
    fetch(`/api/notes?studentEmail=${encodeURIComponent(studentEmail)}`)
      .then(r => r.json())
      .then(data => {
        const notes = data.notes ?? {};
        setAllNotes(notes);
        const mine = notes[tutorId]?.note ?? '';
        setMyNote(mine);
        setSavedNote(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentEmail, tutorId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, tutorName, studentEmail, note: myNote }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }
      // Update local state so other tutors' section refreshes
      setAllNotes(prev => ({
        ...prev,
        [tutorId]: { note: myNote, tutorName, updatedAt: new Date().toISOString() },
      }));
      setSavedNote(myNote);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const safeEmail = isSafeEmail(studentEmail) ? studentEmail : null;
  const otherNotes = Object.entries(allNotes).filter(([id]) => id !== tutorId);

  return (
    <div style={{ maxWidth: 600 }}>
      <button className="btn" style={{ marginBottom: 24 }} onClick={() => navigate('/tutor/dashboard')}>
        <ArrowLeft size={15} /> Back
      </button>

      {/* Student info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div className={`avatar xl ${avatarColor}`}>{initials}</div>
        <div>
          <h2 className="serif" style={{ fontSize: 24, marginBottom: 4 }}>{displayName}</h2>
          {student?.year && <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{student.year}</div>}
        </div>
      </div>

      <div style={{ padding: '16px 20px', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Email</div>
        {safeEmail ? (
          <a href={`mailto:${safeEmail}`} style={{ fontSize: 14, color: 'var(--accent)' }}>{safeEmail}</a>
        ) : (
          <span style={{ fontSize: 14, color: 'var(--fg-muted)' }}>{studentEmail || 'Unknown'}</span>
        )}
      </div>

      {/* Shared notes from other tutors */}
      {!loading && otherNotes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Notes from other tutors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {otherNotes.map(([id, entry]) => entry.note ? (
              <div key={id} style={{ padding: '14px 16px', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{entry.tutorName || id}</span>
                  {entry.updatedAt && (
                    <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{formatDate(entry.updatedAt)}</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--fg-soft)', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{entry.note}</p>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Current tutor's own note */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Your notes</div>
        <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 12 }}>
          Visible to all tutors. Use these to share context — areas of difficulty, progress, what to cover next.
        </p>
        {loading ? (
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Loading…</div>
        ) : (
          <>
            <textarea
              className="input"
              style={{ width: '100%', height: 140, resize: 'vertical', marginBottom: 12, boxSizing: 'border-box' }}
              placeholder={`Notes about ${displayName} visible to all tutors…`}
              value={myNote}
              onChange={e => { setMyNote(e.target.value); setSaved(false); setSaveError(''); }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn primary" onClick={handleSave} disabled={saving || myNote === savedNote}>
                {saving ? 'Saving…' : 'Save notes'}
              </button>
              {saved && <span style={{ fontSize: 13, color: 'var(--success, #27ae60)' }}>Saved ✓</span>}
              {saveError && <span style={{ fontSize: 13, color: 'var(--danger, #c0392b)' }}>{saveError}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
