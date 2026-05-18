import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { Search, Calendar, BookOpen, Video, Trophy, Users } from '../ui/Icons.jsx';

const NAV_STUDENT = [
  { label: 'Browse',   to: '/browse',   icon: Search },
  { label: 'Sessions', to: '/sessions', icon: Calendar },
  { label: 'Lectures', to: '/lectures', icon: BookOpen },
  { label: 'Videos',   to: '/videos',   icon: Video },
];

const NAV_TUTOR = [
  { label: 'Dashboard',   to: '/tutor/dashboard',     icon: Trophy },
  { label: 'Availability',to: '/tutor/availability',  icon: Calendar },
  { label: 'Lectures',    to: '/lectures',             icon: BookOpen },
  { label: 'Videos',      to: '/videos',               icon: Video },
];

export default function MobileNav() {
  const { user } = useAuth();
  const nav = user?.role === 'tutor' ? NAV_TUTOR : NAV_STUDENT;

  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      {nav.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        >
          <item.icon size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
