import { apiRequest } from '@/api/client';

export interface GoogleCalendarStatus {
  disponivel: boolean;
  conectado: boolean;
  email: string | null;
  pendentes: number;
  falhas: number;
}

const path = '/integracoes/google-agenda';
export const googleCalendarApi = {
  status: () => apiRequest<GoogleCalendarStatus>(path),
  authorize: () => apiRequest<{ url: string }>(`${path}/autorizar`, { method: 'POST' }),
  disconnect: () => apiRequest<void>(path, { method: 'DELETE', responseType: 'void' }),
  retry: () => apiRequest<void>(`${path}/tentar-novamente`, { method: 'POST', responseType: 'void' }),
};
