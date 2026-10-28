import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from './api';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    api('POST', '/auth/logout').catch(() => {});
    tokenStore.clear();
    setUser(null);
  }, []);

  // Khôi phục phiên khi tải lại trang: hỏi backend token còn hợp lệ không.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear();
      setUser(null);
    });
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api<AuthUser>('GET', '/auth/me')
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api<{ accessToken: string; user: AuthUser }>('POST', '/auth/login', {
      body: { email, password },
    });
    tokenStore.set(res.accessToken);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return ctx;
}
