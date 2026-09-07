import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_STORAGE_KEY, registerUnauthorizedHandler } from '../api/axios';

const USER_STORAGE_KEY = 'tcams_user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Expects POST /api/auth/login to accept { email, password } and return
 * { token, user: { id, email, name, role } }, with `role` one of the
 * server/src/models/Role.js names (ADMIN, REGISTRAR, PROCUREMENT_OFFICER,
 * HR_OFFICER, FINANCE_OFFICER, AUDITOR). That endpoint does not exist yet -
 * see the Phase 9 PR description - so login will fail until it's added.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [isInitializing, setIsInitializing] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    setIsInitializing(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!allowedRoles || allowedRoles.length === 0) {
        return true;
      }
      if (!user?.role) {
        return false;
      }
      return user.role === 'ADMIN' || allowedRoles.includes(user.role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isInitializing,
      login,
      logout,
      hasRole,
    }),
    [token, user, isInitializing, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
