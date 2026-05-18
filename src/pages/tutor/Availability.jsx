import { useState } from 'react';
import { useAuth } from '../../store/AuthContext.jsx';
import { TUTORS, DAYS, DAY_NUMS, HOURS, SLOTS } from '../../data/index.js';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function Availability() {
  const { user } = useAuth();
  const tutor = TUTORS.find(t => t.id === user?.tutorId) || TUTORS[0];
  const storageKey = `ph_availability_${tutor.id}`;

  const [availability, setAvailability] = useState(() => {
    const persisted = load(storageKey, null);
    if (persisted) return persisted;

    const initialSlots = SLOTS[tutor.id] || {};
    const a = {};
    DAYS.forEach((_, di) => {
      a[di] = {};
      HOURS.forEach((_, hi) => {
        a[di][hi] = initialSlots[di]?.[hi] ?? null;
      });
    });
    return a;
  });

  const toggleSlot = (di, hi) => {
    setAvailability(a => {
      const cur = a[di]?.[hi];
      if (cur === 1) return a;
      const next = { ...a, [di]: { ...a[di], [hi]: cur === 0 ? null : 0 } };
      save(storageKey, next);
      return next;
    });
  };

  const freeCount = Object.values(availability).reduce((sum, day) =>
    sum + Object.values(day).filter(v => v === 0).length, 0);
  const bookedCount = Object.values(availability).reduce((sum, day) =>
    sum + Object.values(day).filter(v => v === 1).length, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Tutor dashboard</div>
          <h1 className="page-title">Availability</h1>
          <p className="page-sub">Click a slot to open or close it. Booked slots are locked.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-card-value serif">{freeCount}</div>
          <div className="stat-card-label">open slots this week</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-card-value serif">{bookedCount}</div>
          <div className="stat-card-label">sessions booked</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-card-value serif">{HOURS.length * DAYS.length - freeCount - bookedCount}</div>
          <div className="stat-card-label">closed slots</div>
        </div>
      </div>

      <div className="avail-grid">
        <div className="avail-header">
          <div className="avail-time-col" />
          {DAYS.map((d, i) => (
            <div key={d} className="avail-day-head">
              <div style={{ fontWeight: 600, fontSize: 13 }}>{d}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>May {DAY_NUMS[i]}</div>
            </div>
          ))}
        </div>
        {HOURS.map((h, hi) => (
          <div key={h} className="avail-row">
            <div className="avail-time">{h}</div>
            {DAYS.map((_, di) => {
              const state = availability[di]?.[hi];
              return (
                <button
                  key={di}
                  type="button"
                  className={`avail-cell ${state === 0 ? 'free' : state === 1 ? 'booked' : 'closed'}`}
                  onClick={() => toggleSlot(di, hi)}
                  disabled={state === 1}
                  title={state === 1 ? 'Booked' : state === 0 ? 'Open — click to close' : 'Closed — click to open'}
                />
              );
            })}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 16, padding: '10px 0', fontSize: 12, color: 'var(--fg-muted)' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--success)', marginRight: 5 }} />Open</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--accent)', marginRight: 5 }} />Booked</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--bg-sunk)', border: '1px solid var(--border)', marginRight: 5 }} />Closed</span>
        </div>
      </div>
    </div>
  );
}
