import { createContext, useContext, useState } from 'react';
import { STUDENT_SESSIONS } from '../data/index.js';

const AppDataContext = createContext(null);

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function AppDataProvider({ children }) {
  const [bookings, setBookings] = useState(() => load('ph_bookings', []));
  const [rsvps, setRsvps] = useState(() => load('ph_rsvp', { L1: true }));
  const [savedVideos, setSavedVideos] = useState(() => load('ph_saved_videos', { V5: true }));
  const [uploads, setUploads] = useState(() => load('ph_uploads', []));

  const addBooking = (booking) => {
    setBookings(b => {
      const next = [...b, { ...booking, id: `bk-${Date.now()}`, status: 'upcoming' }];
      save('ph_bookings', next);
      return next;
    });
  };

  // Merge persisted bookings with mock seed data
  const allStudentSessions = [...STUDENT_SESSIONS, ...bookings];

  const toggleRsvp = (id) => {
    setRsvps(r => {
      const next = { ...r, [id]: !r[id] };
      save('ph_rsvp', next);
      return next;
    });
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
      rsvps, toggleRsvp,
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
