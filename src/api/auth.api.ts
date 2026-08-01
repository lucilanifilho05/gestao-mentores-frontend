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
