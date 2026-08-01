import {
  useQuery,
} from '@tanstack/react-query';

import {
  coursesApi,
} from '@/api/courses.api';

import type {
  ListarCursosParams,
  ListarCursosResponse,
} from '@/types/courses.types';

export const coursesQueryKeys = {
  all: ['cursos'] as const,

  lists: () =>
    [
      ...coursesQueryKeys.all,
      'lista',
    ] as const,

  list: (
    params: ListarCursosParams,
  ) =>
    [
      ...coursesQueryKeys.lists(),
      params,
    ] as const,
};

export function useCourses(
  params: ListarCursosParams,
) {
  return useQuery<ListarCursosResponse>({
    queryKey:
      coursesQueryKeys.list(params),

    queryFn: () =>
      coursesApi.listar(params),

    placeholderData: (
      previousData,
    ) => previousData,
  });
}