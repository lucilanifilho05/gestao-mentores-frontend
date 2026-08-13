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
        'Não foi possível acessar o sistema. Verifique sua conexão e tente novamente.',
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
