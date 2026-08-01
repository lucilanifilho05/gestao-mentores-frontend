import {
  apiRequest,
} from '@/api/client';

import type {
  DesvincularMentorCursoResponse,
  MentorVinculadoCurso,
  VincularMentorCursoResponse,
} from '@/types/course-mentors.types';

import type {
  AlterarStatusCursoDto,
  AtualizarCursoDto,
  CriarCursoDto,
  CursoAtualizado,
  CursoCriado,
  ListarCursosParams,
  ListarCursosResponse,
} from '@/types/courses.types';

function criarQueryString(
  params: ListarCursosParams,
): string {
  const query =
    new URLSearchParams();

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

  if (
    params.apenas_meus !== undefined
  ) {
    query.set(
      'apenas_meus',
      String(
        params.apenas_meus,
      ),
    );
  }

  /*
   * Não utilizar "if (params.ativo)",
   * pois ativo=false também deve ser enviado.
   */
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

export const coursesApi = {
  listar(
    params: ListarCursosParams,
  ): Promise<ListarCursosResponse> {
    return apiRequest<ListarCursosResponse>(
      `/cursos${criarQueryString(params)}`,
    );
  },

  criar(
    payload: CriarCursoDto,
  ): Promise<CursoCriado> {
    return apiRequest<CursoCriado>(
      '/cursos',
      {
        method: 'POST',
        body: payload,
      },
    );
  },

  atualizar(
    cursoId: string,
    payload: AtualizarCursoDto,
  ): Promise<CursoAtualizado> {
    return apiRequest<CursoAtualizado>(
      `/cursos/${encodeURIComponent(
        cursoId,
      )}`,
      {
        method: 'PATCH',
        body: payload,
      },
    );
  },

  alterarStatus(
    cursoId: string,
    payload: AlterarStatusCursoDto,
  ): Promise<CursoAtualizado> {
    return apiRequest<CursoAtualizado>(
      `/cursos/${encodeURIComponent(
        cursoId,
      )}/status`,
      {
        method: 'PATCH',
        body: payload,
      },
    );
  },

  listarMentores(
    cursoId: string,
  ): Promise<MentorVinculadoCurso[]> {
    return apiRequest<
      MentorVinculadoCurso[]
    >(
      `/cursos/${encodeURIComponent(
        cursoId,
      )}/mentores`,
    );
  },

  vincularMentor(
    cursoId: string,
    mentorId: string,
  ): Promise<VincularMentorCursoResponse> {
    return apiRequest<
      VincularMentorCursoResponse
    >(
      `/cursos/${encodeURIComponent(
        cursoId,
      )}/mentores/${encodeURIComponent(
        mentorId,
      )}`,
      {
        method: 'POST',
      },
    );
  },

  desvincularMentor(
    cursoId: string,
    mentorId: string,
  ): Promise<DesvincularMentorCursoResponse> {
    return apiRequest<
      DesvincularMentorCursoResponse
    >(
      `/cursos/${encodeURIComponent(
        cursoId,
      )}/mentores/${encodeURIComponent(
        mentorId,
      )}`,
      {
        method: 'DELETE',
      },
    );
  },
};