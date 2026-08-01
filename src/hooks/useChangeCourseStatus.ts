import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  coursesApi,
} from '@/api/courses.api';

import {
  coursesQueryKeys,
} from '@/hooks/useCourses';

import type {
  AlterarStatusCursoParams,
  CursoAtualizado,
} from '@/types/courses.types';

import type {
  ApiError,
} from '@/utils/api-error';

export function useChangeCourseStatus() {
  const queryClient =
    useQueryClient();

  return useMutation<
    CursoAtualizado,
    ApiError,
    AlterarStatusCursoParams
  >({
    mutationFn: ({
      cursoId,
      ativo,
    }) =>
      coursesApi.alterarStatus(
        cursoId,
        {
          ativo,
        },
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          coursesQueryKeys.lists(),
      });
    },
  });
}