import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { STUDENT_SESSIONS, STUDENT_PAST, TUTOR_SESSIONS, PEER_LECTURES } from '../data/index.js';
import { useAuth } from './AuthContext.jsx';

const AppDataContext = createContext(null);

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  // Keyed per user so accounts don't bleed into each other on shared devices
  const bookingKey = user?.email ? `ph_bookings:${user.email}` : 'ph_bookings';
  const cancelKey  = user?.email ? `ph_cancelled:${user.email}` : 'ph_cancelled';
  const [bookings, setBookings] = useState(() => load(bookingKey, []));
  const [cancelledIds, setCancelledIds] = useState(() => load(cancelKey, []));
  const [tutorSessionsList, setTutorSessionsList] = useState(() => load('ph_tutor_sessions', TUTOR_SESSIONS));
  const [ratings, setRatings] = useState(() => load('ph_ratings', {}));
  const [rsvps, setRsvps] = useState(() => load('ph_rsvp', {}));
  const [rsvpCounts, setRsvpCounts] = useState({});

  // Load bookings from Redis when user is known — Redis is authoritative, replaces local state
  useEffect(() => {
    if (!user?.email) return;
    const key = `ph_bookings:${user.email}`;
    fetch(`/api/bookings?userEmail=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          const remote = data.bookings ?? [];
          setBookings(remote);
          save(key, remote);
        }
      })
      .catch(() => {});
  }, [user?.email]);

  useEffect(() => {
    const ids = PEER_LECTURES.map(l => l.id).join(',');
    fetch(`/api/rsvp-counts?ids=${ids}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setRsvpCounts(data); })
      .catch(() => {});
  }, []);
  const [savedVideos, setSavedVideos] = useState(() => load('ph_saved_videos', { V5: true }));
  const [uploads, setUploads] = useState(() => load('ph_uploads', []));

  const addBooking = (booking) => {
    const newBooking = { ...booking, id: `bk-${Date.now()}`, status: 'upcoming' };
    setBookings(b => {
      const next = [...b, newBooking];
      save(bookingKey, next);
      return next;
    });
    if (user?.email) {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, booking: newBooking }),
      }).catch(() => {});
    }
  };

  const cancelStudentSession = (id) => {
    setBookings(b => {
      const next = b.filter(bk => bk.id !== id);
      save(bookingKey, next);
      return next;
    });
    setCancelledIds(c => {
      const next = [...c, id];
      save(cancelKey, next);
      return next;
    });
    if (user?.email) {
      fetch(`/api/bookings?userEmail=${encodeURIComponent(user.email)}&bookingId=${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  };

  const cancelTutorSession = (id) => {
    setTutorSessionsList(s => {
      const next = s.filter(ts => ts.id !== id);
      save('ph_tutor_sessions', next);
      return next;
    });
  };

  const addRating = (sessionId, rating) => {
    setRatings(r => {
      const next = { ...r, [sessionId]: rating };
      save('ph_ratings', next);
      return next;
    });
  };

  const allStudentSessions = useMemo(
    () => [...STUDENT_SESSIONS, ...bookings].filter(s => !cancelledIds.includes(s.id)),
    [bookings, cancelledIds]
  );

  // Past sessions that haven't been rated yet (skip dismissed ones too)
  const unratedPastSessions = useMemo(
    () => STUDENT_PAST.filter(s => !ratings[s.id]),
    [ratings]
  );

  const toggleRsvp = (id, userEmail) => {
    const joining = !rsvps[id];
    // Optimistic UI update
    setRsvps(r => { const next = { ...r, [id]: joining }; save('ph_rsvp', next); return next; });
    setRsvpCounts(c => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + (joining ? 1 : -1)) }));
    // Persist to KV
    if (userEmail) {
      fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId: id, email: userEmail, join: joining }),
      })
        .then(r => r.json())
        .then(data => { if (data.count !== undefined) setRsvpCounts(c => ({ ...c, [id]: data.count })); })
        .catch(() => {});
    }
  };

  const toggleSavedVideo = (id) => {
    setSavedVideos(s => {
      const next = { ...s, [id]: !s[id] };
      save('ph_saved_videos', next);
      return next;
    });
  };

  const addUpload = (upload) => {
    setUploads(u => {
      const next = [...u, {
        ...upload,
        id: `up-${Date.now()}`,
        uploadedAt: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
        views: 0,
      }];
      save('ph_uploads', next);
      return next;
    });
  };

  return (
    <AppDataContext.Provider value={{
      bookings, addBooking, allStudentSessions,
      cancelStudentSession,
      tutorSessionsList, cancelTutorSession,
      ratings, addRating, unratedPastSessions,
      rsvps, rsvpCounts, toggleRsvp,
      savedVideos, toggleSavedVideo,
      uploads, addUpload,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
