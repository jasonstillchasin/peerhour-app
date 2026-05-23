import { Outlet, Link, useLocation } from 'react-router-dom';

export default function GuestShell() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="guest-shell">
      {!isHome && (
        <nav className="guest-nav">
          <Link to="/" className="guest-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/light.png" className="logo-light-img" alt="" style={{ height: 28, width: 'auto' }} />
            <img src="/dark.png" className="logo-dark-img" alt="" style={{ height: 28, width: 'auto' }} />
            <span className="serif" style={{ fontSize: 20 }}>Redd<em style={{ color: 'var(--accent)' }}>ux</em></span>
          </Link>
          <div className="guest-nav-actions">
            {pathname !== '/login' && (
              <Link to="/login" className="btn">Sign in</Link>
            )}
            {pathname !== '/signup' && (
              <Link to="/signup" className="btn primary">Sign up free</Link>
            )}
          </div>
        </nav>
      )}
      <Outlet />
    </div>
  );
}
