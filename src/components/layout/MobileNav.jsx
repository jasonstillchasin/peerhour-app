import { NavLink } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import { Search, Calendar, BookOpen, Video, Trophy, Users, User } from '../ui/Icons.jsx';

const NAV_STUDENT = [
  { label: 'Browse',   to: '/browse',   icon: Search },
  { label: 'Sessions', to: '/sessions', icon: Calendar },
  { label: 'Lectures', to: '/lectures', icon: BookOpen },
  { label: 'Videos',   to: '/videos',   icon: Video },
  { label: 'Profile',  to: '/profile',  icon: User },
];

const NAV_TUTOR = [
  { label: 'Dashboard',  to: '/tutor/dashboard',    icon: Trophy },
  { label: 'Avail.',     to: '/tutor/availability', icon: Calendar },
  { label: 'Lectures',   to: '/lectures',            icon: BookOpen },
  { label: 'Videos',     to: '/videos',              icon: Video },
  { label: 'Profile',    to: '/profile',             icon: User },
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
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
