import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useAuth } from './store/AuthContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import GuestShell from './components/layout/GuestShell.jsx';
import HybridShell from './components/layout/HybridShell.jsx';

import Home from './pages/public/Home.jsx';
import Login from './pages/public/Login.jsx';
import Signup from './pages/public/Signup.jsx';
import Browse from './pages/student/Browse.jsx';
import TutorProfile from './pages/student/TutorProfile.jsx';
import MyBookings from './pages/student/MyBookings.jsx';
import Lectures from './pages/student/Lectures.jsx';
import Videos from './pages/student/Videos.jsx';
import TutorDash from './pages/tutor/Dashboard.jsx';
import TutorProfileEdit from './pages/tutor/Profile.jsx';
import UploadContent from './pages/tutor/UploadContent.jsx';
import Availability from './pages/tutor/Availability.jsx';

// Redirects logged-in users to their home screen
function RequireGuest() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'tutor' ? '/tutor/dashboard' : '/browse'} replace />;
  return <Outlet />;
}

// Redirects guests to the landing page
function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

// Redirects wrong-role users back to browse
function RequireRole({ role }) {
  const { user } = useAuth();
  if (user?.role !== role) return <Navigate to="/browse" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Guest-only: landing, login, signup */}
        <Route element={<RequireGuest />}>
          <Route element={<GuestShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Route>

        {/* Public: lectures visible without login; RSVP requires auth (enforced in Lectures.jsx) */}
        <Route element={<HybridShell />}>
          <Route path="/lectures" element={<Lectures />} />
        </Route>

        {/* Authenticated: all app routes */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/browse" element={<Browse />} />
            <Route path="/tutor/:id" element={<TutorProfile />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/sessions" element={<MyBookings />} />

            {/* Tutor-only */}
            <Route element={<RequireRole role="tutor" />}>
              <Route path="/tutor/dashboard" element={<TutorDash />} />
              <Route path="/tutor/profile" element={<TutorProfileEdit />} />
              <Route path="/tutor/availability" element={<Availability />} />
              <Route path="/tutor/upload" element={<UploadContent />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}
