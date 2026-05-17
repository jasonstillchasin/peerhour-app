import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../store/AuthContext.jsx';
import {
  Search, Calendar, BookOpen, Video, Users,
  Moon, Sun, LogOut, Trophy, Sparkles,
} from '../ui/Icons.jsx';

const NAV_STUDENT = [
  { label: 'Browse tutors', to: '/browse', icon: Search },
  { label: 'My sessions', to: '/sessions', icon: Calendar },
  null,
  { label: 'Peer lectures', to: '/lectures', icon: BookOpen, badge: 'NEW' },
  { label: 'Video lessons', to: '/videos', icon: Video },
];

const NAV_TUTOR = [
  { label: 'Dashboard', to: '/tutor/dashboard', icon: Trophy },
  { label: 'My profile', to: '/tutor/profile', icon: Users },
  { label: 'Availability', to: '/tutor/availability', icon: Calendar },
  { label: 'Upload content', to: '/tutor/upload', icon: Sparkles },
  null,
  { label: 'Peer lectures', to: '/lectures', icon: BookOpen, badge: 'NEW' },
  { label: 'Video lessons', to: '/videos', icon: Video },
];

export default function Sidebar({ theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'tutor' ? NAV_TUTOR : NAV_STUDENT;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="sidebar-logo-mark serif">ph</span>
        <span className="sidebar-logo-name">peerhour</span>
      </div>

      {user && (
        <div className="sidebar-pov">
          <div className={`avatar sm ${user.avatarColor || 'avatar-c1'}`}>
            {user.initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 1, textTransform: 'capitalize' }}>
              {user.role}
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {nav.map((item, i) =>
          item === null ? (
            <div key={i} style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-soft)', padding: '8px 12px 4px', marginTop: 4 }}>
              Explore
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '2px 6px', borderRadius: 999 }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-link"
          onClick={onToggleTheme}
          style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          className="sidebar-link"
          onClick={handleLogout}
          style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left', color: 'var(--danger)' }}
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
