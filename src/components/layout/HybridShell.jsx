import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';

// Renders AppShell for logged-in users, simple guest nav for everyone else.
// Used for routes that should be publicly accessible (e.g. /lectures).
export default function HybridShell() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('ph_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ph_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  if (user) {
    return (
      <div className="app-shell">
        <Sidebar theme={theme} onToggleTheme={toggleTheme} />
        <main className="main-content">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="guest-shell">
      <nav className="guest-nav">
        <Link to="/" className="guest-nav-logo serif" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/light.png" className="logo-light-img" alt="" style={{ height: 26, width: 'auto' }} />
          <img src="/dark.png"  className="logo-dark-img"  alt="" style={{ height: 26, width: 'auto' }} />
          Redd<em style={{ color: 'var(--accent)' }}>ux</em>
        </Link>
        <div className="guest-nav-actions">
          <Link to="/login" className="btn">Sign in</Link>
          <Link to="/signup" className="btn btn-primary">Sign up free</Link>
        </div>
      </nav>
      <div className="guest-home-wrap">
        <Outlet />
      </div>
    </div>
  );
}
