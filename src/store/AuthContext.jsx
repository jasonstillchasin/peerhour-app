import { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../data/index.js';

const AuthContext = createContext(null);

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ph_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setAndPersist = (u) => {
    setUser(u);
    localStorage.setItem('ph_user', JSON.stringify(u));
    return u;
  };

  // OTP login — step 1
  const requestLoginOTP = async (email) => {
    await apiPost('/api/request-otp', { email, mode: 'login' });
  };

  // OTP login — step 2
  const verifyLoginOTP = async (email, code) => {
    const { user: u } = await apiPost('/api/verify-otp', { email, code, mode: 'login' });
    return setAndPersist(u);
  };

  // OTP signup — step 1
  const requestSignupOTP = async (email) => {
    await apiPost('/api/request-otp', { email, mode: 'signup' });
  };

  // OTP signup — step 2
  const verifySignupOTP = async (email, code, name, year, house) => {
    const { user: u } = await apiPost('/api/verify-otp', { email, code, mode: 'signup', name, year, house });
    return setAndPersist(u);
  };

  // Demo-only direct login — bypasses OTP for MOCK_USERS
  const loginDirect = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Demo login failed.');
    const { password: _, ...safe } = found;
    return setAndPersist(safe);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ph_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      requestLoginOTP,
      verifyLoginOTP,
      requestSignupOTP,
      verifySignupOTP,
      loginDirect,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
