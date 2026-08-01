import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
  subscribeAuthSession,
} from '@/auth/session';
import type {
  LoginRequest,
  LoginResponse,
  UsuarioAutenticado,
} from '@/types/auth.types';

export type AuthStatus = 'loading' | 'ready';

export interface AuthContextValue {
  status: AuthStatus;
  session: LoginResponse | null;
  user: UsuarioAutenticado | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<LoginResponse | null>(getAuthSession());

  useEffect(() => subscribeAuthSession(setSession), []);

  useEffect(() => {
    let active = true;

    async function initialize(): Promise<void> {
      try {
        const refreshedSession = await authApi.refresh();
        const user = await authApi.me();

        if (active) {
          setAuthSession({
            ...refreshedSession,
            usuario: user,
          });
        }
      } catch {
        clearAuthSession();
      } finally {
        if (active) {
          setStatus('ready');
        }
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      queryClient.clear();

      const loginSession = await authApi.login(credentials);
      setAuthSession(loginSession);

      try {
        const user = await authApi.me();
        setAuthSession({ ...loginSession, usuario: user });
      } catch (error) {
        clearAuthSession();
        throw error;
      }
    },
    [queryClient],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      clearAuthSession();
      queryClient.clear();
    }
  }, [queryClient]);

  const logoutAll = useCallback(async (): Promise<void> => {
    try {
      await authApi.logoutAll();
    } finally {
      clearAuthSession();
      queryClient.clear();
    }
  }, [queryClient]);

  const reloadUser = useCallback(async (): Promise<void> => {
    const currentSession = getAuthSession();

    if (!currentSession) {
      return;
    }

    const user = await authApi.me();
    setAuthSession({ ...currentSession, usuario: user });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.usuario ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
      logoutAll,
      reloadUser,
    }),
    [status, session, login, logout, logoutAll, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
