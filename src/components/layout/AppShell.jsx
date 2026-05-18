import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import RatingModal from '../ui/RatingModal.jsx';
import { useAuth } from '../../store/AuthContext.jsx';
import { useAppData } from '../../store/AppDataContext.jsx';

export default function AppShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ph_theme') || 'light');
  const { user } = useAuth();
  const { unratedPastSessions, addRating } = useAppData();
  const [ratingSession, setRatingSession] = useState(null);
  const promptShown = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ph_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!promptShown.current && user?.role === 'student' && unratedPastSessions.length > 0) {
      promptShown.current = true;
      const t = setTimeout(() => setRatingSession(unratedPastSessions[0]), 600);
      return () => clearTimeout(t);
    }
  }, [user, unratedPastSessions]);

  const handleSubmitRating = (stars, comment) => {
    addRating(ratingSession.id, { stars, comment, tutorId: ratingSession.tutorId, at: Date.now() });
    const remaining = unratedPastSessions.filter(s => s.id !== ratingSession.id);
    setRatingSession(null);
    if (remaining.length > 0) {
      setTimeout(() => setRatingSession(remaining[0]), 400);
    }
  };

  const handleDismiss = () => {
    addRating(ratingSession.id, { skipped: true, at: Date.now() });
    setRatingSession(null);
  };

  return (
    <div className="app-shell">
      <Sidebar theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      <main className="main-content">
        <Outlet />
      </main>
      <MobileNav />
      {ratingSession && (
        <RatingModal
          session={ratingSession}
          onSubmit={handleSubmitRating}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
