import { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../data/index.js';

const AuthContext = createContext(null);

const ALLOWED_SIGNUP_DOMAIN = '@reddamnorthshore.nsw.edu.au';

// In-memory OTP store — cleared on page refresh (intentional)
const otpStore = {};

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOTP(email) {
  const code = genCode();
  otpStore[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
  return code;
}

function checkOTP(email, code) {
  const entry = otpStore[email];
  if (!entry) throw new Error('No code found. Request a new one.');
  if (Date.now() > entry.expires) {
    delete otpStore[email];
    throw new Error('Code expired. Request a new one.');
  }
  if (entry.code !== code.trim()) throw new Error('Wrong code. Try again.');
  delete otpStore[email];
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

  const getAllUsers = () => {
    try {
      const reg = JSON.parse(localStorage.getItem('ph_registered') || '[]');
      return [...MOCK_USERS, ...reg];
    } catch {
      return [...MOCK_USERS];
    }
  };

  const setAndPersist = (safe) => {
    setUser(safe);
    localStorage.setItem('ph_user', JSON.stringify(safe));
    return safe;
  };

  // OTP login — step 1: request code
  const requestLoginOTP = (email) => {
    const norm = email.trim().toLowerCase();
    const found = getAllUsers().find(u => u.email === norm);
    if (!found) throw new Error('No account found for that email. Sign up instead.');
    return storeOTP(norm);
  };

  // OTP login — step 2: verify code + sign in
  const verifyLoginOTP = (email, code) => {
    const norm = email.trim().toLowerCase();
    checkOTP(norm, code);
    const found = getAllUsers().find(u => u.email === norm);
    if (!found) throw new Error('Account not found.');
    const { password: _, ...safe } = found;
    return setAndPersist(safe);
  };

  // OTP signup — step 1: validate domain + request code
  const requestSignupOTP = (email) => {
    const norm = email.trim().toLowerCase();
    if (!norm.endsWith(ALLOWED_SIGNUP_DOMAIN)) {
      throw new Error(`Only ${ALLOWED_SIGNUP_DOMAIN} email addresses can sign up.`);
    }
    if (getAllUsers().some(u => u.email === norm)) {
      throw new Error('An account with that email already exists. Sign in instead.');
    }
    return storeOTP(norm);
  };

  // OTP signup — step 2: verify code + create account
  const verifySignupOTP = (email, code, name, year, house) => {
    const norm = email.trim().toLowerCase();
    checkOTP(norm, code);
    const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: norm,
      role: 'student',
      initials,
      avatarColor: 'avatar-c1',
      subjects: [],
      sessionsCount: 0,
      rating: null,
      year: Number(year),
      house,
    };
    try {
      const reg = JSON.parse(localStorage.getItem('ph_registered') || '[]');
      reg.push(newUser);
      localStorage.setItem('ph_registered', JSON.stringify(reg));
    } catch {}
    return setAndPersist(newUser);
  };

  // Demo-only direct login — bypasses OTP for MOCK_USERS
  const loginDirect = (email, password) => {
    const found = getAllUsers().find(u => u.email === email && u.password === password);
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
