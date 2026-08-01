import type { LoginResponse } from '@/types/auth.types';

type SessionListener = (session: LoginResponse | null) => void;

let currentSession: LoginResponse | null = null;
const listeners = new Set<SessionListener>();

export function getAuthSession(): LoginResponse | null {
  return currentSession;
}

export function getAccessToken(): string | null {
  return currentSession?.accessToken ?? null;
}

export function setAuthSession(session: LoginResponse): void {
  currentSession = session;
  listeners.forEach((listener) => listener(currentSession));
}

export function clearAuthSession(): void {
  currentSession = null;
  listeners.forEach((listener) => listener(null));
}

export function subscribeAuthSession(listener: SessionListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
