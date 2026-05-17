import { Outlet, Link, useLocation } from 'react-router-dom';

export default function GuestShell() {
  const { pathname } = useLocation();

  return (
    <div className="guest-shell">
      <nav className="guest-nav">
        <Link to="/" className="guest-nav-logo serif">peerhour</Link>
        <div className="guest-nav-actions">
          {pathname !== '/login' && (
            <Link to="/login" className="btn">Sign in</Link>
          )}
          {pathname !== '/signup' && (
            <Link to="/signup" className="btn primary">Sign up free</Link>
          )}
        </div>
      </nav>
      <div className={pathname === '/' ? 'guest-home-wrap' : ''}>
        <Outlet />
      </div>
    </div>
  );
}
