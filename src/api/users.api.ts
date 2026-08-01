import { apiRequest } from '@/api/client';

import type {
  AlterarStatusUsuarioDto,
  CriarUsuarioDto,
  ListarUsuariosParams,
  ListarUsuariosResponse,
  UsuarioCriado,
  UsuarioStatusAtualizado,
} from '@/types/users.types';

function criarQueryString(
  params: ListarUsuariosParams,
): string {
  const query = new URLSearchParams();

  if (params.pagina !== undefined) {
    query.set(
      'pagina',
      String(params.pagina),
    );
  }

  if (params.limite !== undefined) {
    query.set(
      'limite',
      String(params.limite),
    );
  }

  if (params.busca) {
    query.set(
      'busca',
      params.busca,
    );
  }

  if (params.papel) {
    query.set(
      'papel',
      params.papel,
    );
  }

  if (params.ativo !== undefined) {
    query.set(
      'ativo',
      String(params.ativo),
    );
  }

  const queryString =
    query.toString();

  return queryString
    ? `?${queryString}`
    : '';
}

export const usersApi = {
  listar(
    params: ListarUsuariosParams,
  ): Promise<ListarUsuariosResponse> {
    return apiRequest<ListarUsuariosResponse>(
      `/usuarios${criarQueryString(params)}`,
    );
  },

  criar(
    payload: CriarUsuarioDto,
  ): Promise<UsuarioCriado> {
    return apiRequest<UsuarioCriado>(
      '/usuarios',
      {
        method: 'POST',
        body: payload,
      },
    );
  },

  alterarStatus(
    usuarioId: string,
    payload: AlterarStatusUsuarioDto,
  ): Promise<UsuarioStatusAtualizado> {
    return apiRequest<UsuarioStatusAtualizado>(
      `/usuarios/${encodeURIComponent(usuarioId)}/status`,
      {
        method: 'PATCH',
        body: payload,
      },
    );
  },
};