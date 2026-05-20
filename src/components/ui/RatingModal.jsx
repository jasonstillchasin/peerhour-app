import { useState } from 'react';
import { TUTORS } from '../../data/index.js';

function StarRow({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`rating-star${n <= (hover || value) ? ' active' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onTouchStart={() => setHover(n)}
          onTouchEnd={() => { onChange(n); setHover(0); }}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const LABELS = ['', 'Not great', 'Could be better', 'Pretty good', 'Really helpful', 'Amazing!'];

export default function RatingModal({ session, onSubmit, onDismiss }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const tutor = TUTORS.find(t => t.id === session.tutorId);

  return (
    <div className="rating-overlay" onClick={onDismiss}>
      <div className="rating-modal" onClick={e => e.stopPropagation()}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Rate your session</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 20, lineHeight: 1.2 }}>
          How did it go with {tutor?.name.split(' ')[0] ?? 'your tutor'}?
        </h2>

        {tutor && (
          <div className="rating-modal-session">
            <div className={`avatar sm ${tutor.avatarBg}`}>{tutor.initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{tutor.name}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                {session.subject} · {session.day} {session.dom} {session.month}
              </div>
            </div>
          </div>
        )}

        <StarRow value={stars} onChange={setStars} />

        {stars > 0 && (
          <div style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 16, marginTop: -8, fontWeight: 500 }}>
            {LABELS[stars]}
          </div>
        )}

        <textarea
          className="rating-comment"
          rows={3}
          placeholder={`Leave a note for ${tutor?.name.split(' ')[0] ?? 'your tutor'} (optional)`}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div className="rating-modal-actions">
          <button className="btn" onClick={onDismiss} style={{ fontSize: 13 }}>
            Skip
          </button>
          <button
            className="btn primary"
            disabled={stars === 0}
            style={{ fontSize: 13, opacity: stars === 0 ? 0.4 : 1 }}
            onClick={() => stars > 0 && onSubmit(stars, comment.trim())}
          >
            Submit rating
          </button>
        </div>
      </div>
    </div>
  );
}
