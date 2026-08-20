import { apiRequest } from '@/api/client';
import type { AlterarStatusTurmaDto, AtualizarTurmaDto, CriarTurmaDto, ListarTurmasParams, ListarTurmasResponse, SalvarTurmaDto, TurmaSalva } from '@/types/classes.types';

function queryString(params: ListarTurmasParams): string {
  const query = new URLSearchParams();
  if (params.pagina !== undefined) query.set('pagina', String(params.pagina));
  if (params.limite !== undefined) query.set('limite', String(params.limite));
  if (params.cursoId) query.set('cursoId', params.cursoId);
  if (params.ativo !== undefined) query.set('ativo', String(params.ativo));
  const value = query.toString();
  return value ? `?${value}` : '';
}

export const classesApi = {
  listar: (params: ListarTurmasParams) => apiRequest<ListarTurmasResponse>(`/turmas${queryString(params)}`),
  criar: (payload: CriarTurmaDto) => apiRequest<TurmaSalva>('/turmas', { method: 'POST', body: payload }),
  atualizar: (id: string, payload: AtualizarTurmaDto) => apiRequest<TurmaSalva>(`/turmas/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
  alterarStatus: (id: string, payload: AlterarStatusTurmaDto) => apiRequest<TurmaSalva>(`/turmas/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: payload }),
  clonar: (id: string, payload: SalvarTurmaDto) => apiRequest<TurmaSalva>(`/turmas/${encodeURIComponent(id)}/clonar`, { method: 'POST', body: payload }),
};
