import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ph_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const getAllUsers = () => {
    try {
      const reg = JSON.parse(localStorage.getItem('ph_registered') || '[]');
      return [...MOCK_USERS, ...reg];
    } catch {
      return [...MOCK_USERS];
    }
  };

  const login = (email, password) => {
    const found = getAllUsers().find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid credentials');
    const { password: _, ...safe } = found;
    setUser(safe);
    localStorage.setItem('ph_user', JSON.stringify(safe));
    return safe;
  };

  const signup = (name, email, password, role = 'student', extra = {}) => {
    role = 'student'; // tutor accounts are invite-only
    const all = getAllUsers();
    if (all.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with that email already exists.');
    }
    const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      initials,
      avatarColor: 'avatar-c1',
      subjects: [],
      sessionsCount: 0,
      rating: null,
      ...extra,
    };
    try {
      const reg = JSON.parse(localStorage.getItem('ph_registered') || '[]');
      reg.push(newUser);
      localStorage.setItem('ph_registered', JSON.stringify(reg));
    } catch {
      // localStorage unavailable — session-only
    }
    const { password: _, ...safe } = newUser;
    setUser(safe);
    localStorage.setItem('ph_user', JSON.stringify(safe));
    return safe;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ph_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
