import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function AppShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ph_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ph_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="app-shell">
      <Sidebar theme={theme} onToggleTheme={toggleTheme} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
