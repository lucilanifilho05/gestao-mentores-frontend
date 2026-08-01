# Etapa 1 — conteúdo completo dos arquivos

## `.env`

```dotenv
VITE_API_URL=http://localhost:3000

```

## `.env.example`

```dotenv
VITE_API_URL=http://localhost:3000

```

## `.gitignore`

```text
node_modules
dist
.vite
*.local
.env
.DS_Store

```

## `README.md`

```markdown
# Gestão de Mentores — Frontend

Etapa 1 do frontend em React, TypeScript, Vite e Twind.

## Entregue nesta etapa

- projeto Vite com React e TypeScript;
- variável `VITE_API_URL`;
- tema institucional por tokens CSS;
- Twind com presets Tailwind e Autoprefix;
- cliente HTTP centralizado com `credentials: 'include'`;
- access token mantido somente em memória;
- refresh automático em `401`, com repetição única da requisição;
- trava para impedir múltiplos refreshes concorrentes;
- login, refresh, usuário atual, logout e logout de todas as sessões;
- rotas protegidas por autenticação e papel;
- tela de login responsiva;
- shell autenticado inicial;
- tratamento centralizado de erros HTTP.

## Requisitos

- Node.js 20.19 ou superior;
- backend em `http://localhost:3000`;
- CORS do backend permitindo `http://localhost:5173` com credenciais.

Exemplo de configuração esperada no NestJS:

```ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

## Instalação

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Validação

```bash
npm run typecheck
npm run build
```

## Variável de ambiente

```dotenv
VITE_API_URL=http://localhost:3000
```

## Observação sobre a senha

O DTO enviado informa que existem constantes de comprimento mínimo e máximo, mas os valores dessas constantes não foram fornecidos. Nesta etapa, o frontend valida obrigatoriedade da senha e delega os limites exatos ao backend. Assim que o OpenAPI completo ou `password-policy.ts` for enviado, o schema Zod pode espelhar os valores exatos.

```

## `index.html`

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Gestão de Mentores — acompanhamento acadêmico e operacional."
    />
    <meta name="theme-color" content="#0038a8" />
    <title>Gestão de Mentores</title>
  </head>
  <body class="!block" style="display: none">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

## `package.json`

```json
{
  "name": "gestao-mentores-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --pretty false"
  },
  "engines": {
    "node": ">=20.19.0"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.5.7",
    "@tanstack/react-query": "^5.101.4",
    "@twind/core": "^1.1.3",
    "@twind/preset-autoprefix": "^1.0.7",
    "@twind/preset-tailwind": "^1.1.4",
    "@twind/with-react": "^1.1.3",
    "lucide-react": "^1.27.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.83.0",
    "react-router-dom": "^7.18.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/node": "^22.15.0",
    "@types/react": "^18.3.31",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^6.0.4",
    "typescript": "^5.9.2",
    "vite": "^8.1.5"
  }
}

```

## `src/App.tsx`

```tsx
import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';

export default function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

```

## `src/api/auth.api.ts`

```typescript
import { apiRequest, refreshSession } from '@/api/client';
import type {
  LoginRequest,
  LoginResponse,
  UsuarioAutenticado,
} from '@/types/auth.types';

export const authApi = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
      retryOnUnauthorized: false,
    });
  },

  refresh: refreshSession,

  me(): Promise<UsuarioAutenticado> {
    return apiRequest<UsuarioAutenticado>('/auth/eu');
  },

  logout(): Promise<void> {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
      auth: false,
      retryOnUnauthorized: false,
      responseType: 'void',
    });
  },

  logoutAll(): Promise<void> {
    return apiRequest<void>('/auth/logout-todos', {
      method: 'POST',
      responseType: 'void',
    });
  },
};

```

## `src/api/client.ts`

```typescript
import {
  clearAuthSession,
  getAccessToken,
  setAuthSession,
} from '@/auth/session';
import type { LoginResponse } from '@/types/auth.types';
import { createApiError } from '@/utils/api-error';

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

if (!apiUrl) {
  throw new Error('A variável VITE_API_URL não foi configurada.');
}

type ResponseType = 'json' | 'text' | 'blob' | 'void';

interface ApiRequestOptions
  extends Omit<RequestInit, 'body' | 'headers' | 'method'> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
  responseType?: ResponseType;
}

let refreshPromise: Promise<LoginResponse> | null = null;

function buildUrl(path: string): string {
  return `${apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function isNativeBody(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

function prepareBody(
  body: unknown,
  headers: Headers,
): BodyInit | null | undefined {
  if (body === undefined || body === null) {
    return body as null | undefined;
  }

  if (isNativeBody(body)) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
}

async function readErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
}

async function parseSuccess<T>(
  response: Response,
  responseType: ResponseType,
): Promise<T> {
  if (responseType === 'void' || response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }

  if (responseType === 'text') {
    return (await response.text()) as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function performRefresh(): Promise<LoginResponse> {
  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw createApiError(response.status, body);
  }

  const session = (await response.json()) as LoginResponse;
  setAuthSession(session);
  return session;
}

export async function refreshSession(): Promise<LoginResponse> {
  if (!refreshPromise) {
    refreshPromise = performRefresh()
      .catch((error: unknown) => {
        clearAuthSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers: customHeaders,
    auth = true,
    retryOnUnauthorized = true,
    responseType = 'json',
    ...requestInit
  } = options;

  const headers = new Headers(customHeaders);
  headers.set('Accept', responseType === 'blob' ? '*/*' : 'application/json');

  const accessToken = auth ? getAccessToken() : null;

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...requestInit,
      method,
      headers,
      body: prepareBody(body, headers),
      credentials: 'include',
    });
  } catch {
    throw createApiError(0, {
      message:
        'Não foi possível conectar à API. Verifique se o backend está em execução.',
    });
  }

  if (
    response.status === 401 &&
    auth &&
    retryOnUnauthorized &&
    path !== '/auth/refresh'
  ) {
    try {
      await refreshSession();
      return apiRequest<T>(path, {
        ...options,
        retryOnUnauthorized: false,
      });
    } catch {
      clearAuthSession();
    }
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw createApiError(response.status, errorBody);
  }

  return parseSuccess<T>(response, responseType);
}

export function getApiUrl(): string {
  return apiUrl;
}

```

## `src/auth/session.ts`

```typescript
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

```

## `src/components/forms/FormField.tsx`

```tsx
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    {
      id,
      label,
      error,
      hint,
      leadingIcon,
      className = '',
      ...props
    },
    ref,
  ) {
    const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              {leadingIcon}
            </span>
          ) : null}
          <input
            {...props}
            ref={ref}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            className={`gm-input ${leadingIcon ? 'pl-11' : ''} ${error ? 'gm-input-error' : ''} ${className}`.trim()}
          />
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

```

## `src/components/ui/Alert.tsx`

```tsx
import type { PropsWithChildren } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps extends PropsWithChildren {
  variant?: AlertVariant;
  title?: string;
}

const iconByVariant = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({
  children,
  variant = 'info',
  title,
}: AlertProps): JSX.Element {
  const Icon = iconByVariant[variant];

  return (
    <div className={`gm-alert gm-alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-sm leading-6">{children}</div>
      </div>
    </div>
  );
}

```

## `src/components/ui/Button.tsx`

```tsx
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { LoaderCircle } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'gm-button-primary',
  secondary: 'gm-button-secondary',
  danger: 'gm-button-danger',
  ghost: 'gm-button-ghost',
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      className={`gm-button ${variantClasses[variant]} ${className}`.trim()}
    >
      {isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}

```

## `src/components/ui/ConfirmDialog.tsx`

```tsx
import { AlertTriangle, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" role="presentation">
      <div
        aria-modal="true"
        className="gm-panel w-full max-w-md p-6"
        role="dialog"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
              <AlertTriangle aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-950">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
            onClick={onClose}
            disabled={isLoading}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

```

## `src/components/ui/LoadingScreen.tsx`

```tsx
import { LoaderCircle } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = 'Carregando sua sessão...',
}: LoadingScreenProps): JSX.Element {
  return (
    <main className="gm-app-background flex min-h-screen items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="gm-brand-icon h-14 w-14">
          <LoaderCircle aria-hidden="true" className="h-7 w-7 animate-spin" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">Gestão de Mentores</p>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </div>
    </main>
  );
}

```

## `src/contexts/AuthContext.tsx`

```tsx
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

```

## `src/hooks/useAuth.ts`

```typescript
import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  }

  return context;
}

```

## `src/layouts/AppShell.tsx`

```tsx
import { BookOpenCheck, Home, LogOut, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

function roleLabel(role: 'COORDENADORA' | 'MENTOR'): string {
  return role === 'COORDENADORA' ? 'Coordenadora' : 'Mentor';
}

export function AppShell(): JSX.Element {
  const { user, logout } = useAuth();

  if (!user) {
    return <Outlet />;
  }

  const navItemClass = ({ isActive }: { isActive: boolean }): string =>
    `gm-nav-item ${isActive ? 'gm-nav-item-active' : ''}`;

  return (
    <div className="gm-app-background min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 gm-sidebar lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="gm-brand-icon-inverse h-11 w-11">
            <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white">Gestão de Mentores</p>
            <p className="text-xs text-blue-100/70">Ambiente educacional</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Navegação principal">
          <NavLink to="/" end className={navItemClass}>
            <Home aria-hidden="true" className="h-5 w-5" />
            Início
          </NavLink>

          {user.papel === 'COORDENADORA' ? (
            <NavLink to="/coordenacao" className={navItemClass}>
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              Área da coordenação
            </NavLink>
          ) : null}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="truncate text-sm font-semibold text-white">{user.nome}</p>
            <p className="mt-1 truncate text-xs text-blue-100/70">{user.email}</p>
            <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-50">
              {roleLabel(user.papel)}
            </span>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b gm-border bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] gm-text-primary">
                Gestão de Mentores
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-950">Visão geral da sessão</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.nome}</p>
                <p className="text-xs text-slate-500">{roleLabel(user.papel)}</p>
              </div>
              <Button variant="ghost" onClick={() => void logout()}>
                <LogOut aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

```

## `src/main.tsx`

```tsx
import './twind';
import './styles/global.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from '@/App';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

```

## `src/pages/auth/LoginPage.tsx`

```tsx
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpenCheck, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { FormField } from '@/components/forms/FormField';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/api-error';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .email('Informe um endereço de e-mail válido.')
    .max(254, 'O e-mail deve possuir no máximo 254 caracteres.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginLocationState {
  from?: string;
}

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);

    try {
      await login(data);
      const state = location.state as LoginLocationState | null;
      navigate(state?.from ?? '/', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <main className="gm-app-background min-h-screen lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
      <section className="relative hidden overflow-hidden gm-login-hero p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="relative z-10 flex items-center gap-3">
          <div className="gm-brand-icon-inverse h-12 w-12">
            <BookOpenCheck aria-hidden="true" className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Gestão de Mentores</p>
            <p className="text-sm text-blue-100/75">Organização, acompanhamento e clareza</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Ambiente protegido por perfil de acesso
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-tight text-white">
            Uma visão organizada do trabalho de cada mentor.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100/80">
            Acompanhe tarefas, estrutura acadêmica e resultados em uma interface construída para o dia a dia educacional.
          </p>
        </div>

        <p className="relative z-10 text-sm text-blue-100/60">
          Interface beta para ambiente local ou controlado.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="gm-brand-icon h-11 w-11">
              <BookOpenCheck aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-950">Gestão de Mentores</p>
              <p className="text-xs text-slate-500">Ambiente educacional</p>
            </div>
          </div>

          <div className="gm-panel p-6 sm:p-8">
            <div>
              <p className="text-sm font-semibold gm-text-primary">Bem-vindo</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Acesse sua conta</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use o e-mail e a senha cadastrados pela coordenação.
              </p>
            </div>

            {serverError ? (
              <div className="mt-6">
                <Alert variant="error" title="Não foi possível entrar">
                  {serverError}
                </Alert>
              </div>
            ) : null}

            <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
              <FormField
                id="email"
                label="E-mail"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="nome@instituicao.com.br"
                leadingIcon={<Mail aria-hidden="true" className="h-5 w-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <FormField
                id="senha"
                label="Senha"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                leadingIcon={<LockKeyhole aria-hidden="true" className="h-5 w-5" />}
                error={errors.senha?.message}
                {...register('senha')}
              />

              <Button type="submit" className="w-full justify-center" isLoading={isSubmitting}>
                Entrar
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            O access token permanece somente em memória. O refresh token é mantido pelo backend em cookie HttpOnly.
          </p>
        </div>
      </section>
    </main>
  );
}

```

## `src/pages/errors/AccessDeniedPage.tsx`

```tsx
import { ArrowLeft, ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AccessDeniedPage(): JSX.Element {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <ShieldX aria-hidden="true" className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold text-red-700">Acesso negado</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Seu papel não permite abrir esta página.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          A interface bloqueou a navegação, mas o backend continua sendo a autoridade definitiva sobre a permissão.
        </p>
        <Link to="/" className="gm-link mt-6 inline-flex items-center gap-2">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

```

## `src/pages/errors/NotFoundPage.tsx`

```tsx
import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage(): JSX.Element {
  return (
    <main className="gm-app-background flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="gm-brand-icon mx-auto h-16 w-16">
          <SearchX aria-hidden="true" className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold gm-text-primary">Erro 404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          O endereço informado não corresponde a uma página disponível.
        </p>
        <Link to="/" className="gm-link mt-6 inline-flex items-center gap-2">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}

```

## `src/pages/home/CoordinatorAreaPage.tsx`

```tsx
import { ShieldCheck } from 'lucide-react';

export function CoordinatorAreaPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="gm-panel p-8">
        <div className="gm-brand-icon h-12 w-12">
          <ShieldCheck aria-hidden="true" className="h-6 w-6" />
        </div>
        <p className="mt-6 text-sm font-semibold gm-text-primary">Rota por papel validada</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Área exclusiva da coordenação</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Esta página existe nesta etapa para validar o componente RoleRoute. Os módulos de usuários, cursos e estrutura acadêmica serão implementados nas etapas próprias.
        </p>
      </section>
    </div>
  );
}

```

## `src/pages/home/HomePage.tsx`

```tsx
import { useState } from 'react';
import {
  CheckCircle2,
  Globe2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { getApiUrl } from '@/api/client';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/api-error';

function roleLabel(role: 'COORDENADORA' | 'MENTOR'): string {
  return role === 'COORDENADORA' ? 'Coordenadora' : 'Mentor';
}

export function HomePage(): JSX.Element {
  const { user, reloadUser, logout, logoutAll } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<
    { variant: 'success' | 'error'; message: string } | null
  >(null);

  if (!user) {
    return <></>;
  }

  async function handleRefreshUser(): Promise<void> {
    setIsRefreshing(true);
    setFeedback(null);

    try {
      await reloadUser();
      setFeedback({
        variant: 'success',
        message: 'Dados do usuário atualizados pela rota GET /auth/eu.',
      });
    } catch (error) {
      setFeedback({ variant: 'error', message: getErrorMessage(error) });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogoutAll(): Promise<void> {
    setIsLoggingOutAll(true);

    try {
      await logoutAll();
    } finally {
      setIsLoggingOutAll(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <p className="text-sm font-semibold gm-text-primary">Etapa 1 concluída</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Olá, {user.nome.split(' ')[0]}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              A base do frontend, o cliente HTTP e o fluxo de autenticação já estão conectados aos contratos do backend.
            </p>
          </div>
          <Button variant="secondary" onClick={() => void handleRefreshUser()} isLoading={isRefreshing}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Atualizar perfil
          </Button>
        </div>
      </section>

      {feedback ? <Alert variant={feedback.variant}>{feedback.message}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="gm-panel p-5">
          <div className="flex items-start justify-between">
            <div className="gm-metric-icon gm-metric-icon-blue">
              <UserRound aria-hidden="true" className="h-5 w-5" />
            </div>
            <span className="gm-status-success">Autenticado</span>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Usuário</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-950">{user.nome}</p>
          <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
        </article>

        <article className="gm-panel p-5">
          <div className="gm-metric-icon gm-metric-icon-blue">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">Papel de acesso</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{roleLabel(user.papel)}</p>
          <p className="mt-1 text-sm text-slate-500">Proteção visual e por rota habilitada.</p>
        </article>

        <article className="gm-panel p-5">
          <div className="gm-metric-icon gm-metric-icon-blue">
            <Globe2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="mt-5 text-sm font-medium text-slate-500">API configurada</p>
          <p className="mt-1 truncate text-lg font-bold text-slate-950">{getApiUrl()}</p>
          <p className="mt-1 text-sm text-slate-500">Cookies enviados com credentials: include.</p>
        </article>
      </section>

      <section className="gm-panel overflow-hidden">
        <div className="border-b gm-border px-6 py-5">
          <h3 className="text-lg font-bold text-slate-950">Fluxos disponíveis nesta etapa</h3>
          <p className="mt-1 text-sm text-slate-500">Operações reais da API de autenticação.</p>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-b gm-border p-6 md:border-b-0 md:border-r">
            <div className="flex items-start gap-3">
              <div className="gm-metric-icon gm-metric-icon-green">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-950">Sessão atual</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Revoga a sessão vinculada ao refresh cookie e retorna ao login.
                </p>
              </div>
            </div>
            <Button className="mt-5" variant="secondary" onClick={() => void logout()}>
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Encerrar sessão
            </Button>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="gm-metric-icon gm-metric-icon-red">
                <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-950">Todas as sessões</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Invalida todos os access tokens anteriores e revoga todas as sessões do usuário.
                </p>
              </div>
            </div>
            <Button className="mt-5" variant="danger" onClick={() => setConfirmOpen(true)}>
              Encerrar todas as sessões
            </Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Encerrar todas as sessões?"
        description="Você será desconectado neste dispositivo e em todos os demais acessos vinculados à sua conta."
        confirmLabel="Encerrar todas"
        isLoading={isLoggingOutAll}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleLogoutAll()}
      />
    </div>
  );
}

```

## `src/routes/ProtectedRoute.tsx`

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute(): JSX.Element {
  const location = useLocation();
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

```

## `src/routes/PublicOnlyRoute.tsx`

```tsx
import { Navigate, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';

export function PublicOnlyRoute(): JSX.Element {
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

```

## `src/routes/RoleRoute.tsx`

```tsx
import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import type { Papel } from '@/types/auth.types';

interface RoleRouteProps extends PropsWithChildren {
  allowed: Papel[];
}

export function RoleRoute({ allowed, children }: RoleRouteProps): JSX.Element {
  const { user } = useAuth();

  if (!user || !allowed.includes(user.papel)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}

```

## `src/routes/router.tsx`

```tsx
import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/layouts/AppShell';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AccessDeniedPage } from '@/pages/errors/AccessDeniedPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';
import { RoleRoute } from '@/routes/RoleRoute';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'coordenacao',
            element: (
              <RoleRoute allowed={['COORDENADORA']}>
                <CoordinatorAreaPage />
              </RoleRoute>
            ),
          },
          {
            path: 'acesso-negado',
            element: <AccessDeniedPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

```

## `src/styles/global.css`

```css
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  color: #172033;
  background: #f5f7fb;
  font-synthesis: none;
  text-rendering: optimizeLegibility;

  --color-primary: #0038a8;
  --color-primary-dark: #002b80;
  --color-primary-light: #e8f0ff;
  --color-background: #f5f7fb;
  --color-surface: #ffffff;
  --color-text: #172033;
  --color-text-muted: #667085;
  --color-border: #dde3ed;
  --color-success: #15803d;
  --color-warning: #d97706;
  --color-danger: #c62828;
  --shadow-panel: 0 12px 32px rgba(23, 32, 51, 0.07);
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--color-background);
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background: var(--color-background);
  color: var(--color-text);
}

button,
input {
  font: inherit;
}

button,
a,
input {
  -webkit-tap-highlight-color: transparent;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid rgba(0, 56, 168, 0.22);
  outline-offset: 2px;
}

.gm-app-background {
  background:
    radial-gradient(circle at top right, rgba(0, 56, 168, 0.055), transparent 34rem),
    var(--color-background);
}

.gm-login-hero {
  background:
    radial-gradient(circle at 76% 20%, rgba(255, 255, 255, 0.12), transparent 19rem),
    linear-gradient(145deg, var(--color-primary) 0%, var(--color-primary-dark) 72%);
}

.gm-login-hero::before,
.gm-login-hero::after {
  position: absolute;
  content: "";
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.gm-login-hero::before {
  width: 30rem;
  height: 30rem;
  right: -11rem;
  bottom: -8rem;
}

.gm-login-hero::after {
  width: 18rem;
  height: 18rem;
  right: -3rem;
  bottom: -2rem;
}

.gm-sidebar {
  background: linear-gradient(180deg, var(--color-primary-dark), #001f5f);
}

.gm-panel {
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.gm-border {
  border-color: var(--color-border);
}

.gm-text-primary {
  color: var(--color-primary);
}

.gm-brand-icon,
.gm-brand-icon-inverse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.9rem;
}

.gm-brand-icon {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.gm-brand-icon-inverse {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.gm-input {
  width: 100%;
  height: 2.9rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: #ffffff;
  padding-right: 0.9rem;
  padding-left: 0.9rem;
  color: var(--color-text);
  transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
}

.gm-input::placeholder {
  color: #98a2b3;
}

.gm-input:hover {
  border-color: #bdc7d8;
}

.gm-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(0, 56, 168, 0.1);
  outline: none;
}

.gm-input-error,
.gm-input-error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 4px rgba(198, 40, 40, 0.09);
}

.gm-button {
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease,
    transform 150ms ease, box-shadow 150ms ease;
}

.gm-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.gm-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.gm-button-primary {
  color: #ffffff;
  background: var(--color-primary);
  box-shadow: 0 7px 16px rgba(0, 56, 168, 0.19);
}

.gm-button-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.gm-button-secondary {
  color: var(--color-text);
  border-color: var(--color-border);
  background: #ffffff;
}

.gm-button-secondary:hover:not(:disabled) {
  border-color: #bcc7d8;
  background: #f8fafc;
}

.gm-button-danger {
  color: #ffffff;
  background: var(--color-danger);
}

.gm-button-danger:hover:not(:disabled) {
  background: #a51f1f;
}

.gm-button-ghost {
  color: var(--color-text-muted);
  background: transparent;
}

.gm-button-ghost:hover:not(:disabled) {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.gm-alert {
  display: flex;
  gap: 0.75rem;
  border: 1px solid;
  border-radius: 0.8rem;
  padding: 0.9rem 1rem;
}

.gm-alert-error {
  color: #991b1b;
  border-color: #fecaca;
  background: #fef2f2;
}

.gm-alert-success {
  color: #166534;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.gm-alert-info {
  color: var(--color-primary-dark);
  border-color: #c7d7ff;
  background: var(--color-primary-light);
}

.gm-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.75rem;
  padding: 0.75rem 0.9rem;
  color: rgba(232, 240, 255, 0.72);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 150ms ease, background-color 150ms ease;
}

.gm-nav-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.gm-nav-item-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: inset 3px 0 0 #ffffff;
}

.gm-metric-icon {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.gm-metric-icon-blue {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.gm-metric-icon-green {
  color: var(--color-success);
  background: #ecfdf3;
}

.gm-metric-icon-red {
  color: var(--color-danger);
  background: #fef2f2;
}

.gm-status-success {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.3rem 0.6rem;
  color: var(--color-success);
  background: #ecfdf3;
  font-size: 0.75rem;
  font-weight: 700;
}

.gm-link {
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
}

.gm-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

```

## `src/twind.ts`

```typescript
import install from '@twind/with-react';

import config from '../twind.config';

export default install(config, import.meta.env.PROD);

```

## `src/types/auth.types.ts`

```typescript
export type Papel = 'COORDENADORA' | 'MENTOR';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  usuario: UsuarioAutenticado;
}

```

## `src/utils/api-error.ts`

```typescript
interface BackendErrorBody {
  message?: string | string[];
  error?: string;
  errors?: Record<string, string | string[]>;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Confira os dados informados e tente novamente.',
  401: 'Sua sessão está ausente ou expirou.',
  403: 'Você não possui permissão para realizar esta ação.',
  404: 'O registro solicitado não foi encontrado.',
  409: 'A operação conflita com uma regra do sistema.',
  413: 'O arquivo selecionado é maior que o permitido.',
  500: 'Ocorreu um erro interno. Tente novamente em instantes.',
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly body: unknown;

  constructor(
    message: string,
    status: number,
    body: unknown,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.fieldErrors = fieldErrors;
  }
}

function isBackendErrorBody(value: unknown): value is BackendErrorBody {
  return typeof value === 'object' && value !== null;
}

function normalizeFieldErrors(body: unknown): Record<string, string[]> {
  if (!isBackendErrorBody(body) || !body.errors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(body.errors).map(([field, value]) => [
      field,
      Array.isArray(value) ? value : [value],
    ]),
  );
}

function extractBackendMessage(body: unknown): string | null {
  if (!isBackendErrorBody(body)) {
    return null;
  }

  if (Array.isArray(body.message)) {
    return body.message.filter(Boolean).join(' ');
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  if (typeof body.error === 'string' && body.error.trim()) {
    return body.error;
  }

  return null;
}

export function createApiError(status: number, body: unknown): ApiError {
  const message =
    extractBackendMessage(body) ??
    STATUS_MESSAGES[status] ??
    'Não foi possível concluir a operação.';

  return new ApiError(message, status, body, normalizeFieldErrors(body));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a operação.';
}

```

## `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

```

## `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src"]
}

```

## `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

## `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "twind.config.ts"]
}

```

## `twind.config.ts`

```typescript
import { defineConfig } from '@twind/core';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetTailwind from '@twind/preset-tailwind';

export default defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
});

```

## `vite.config.ts`

```typescript
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react({ target: '18' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});

```
