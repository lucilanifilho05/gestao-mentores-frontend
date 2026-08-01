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
  AtualizarCursoDto,
  CursoAtualizado,
} from '@/types/courses.types';

import type {
  ApiError,
} from '@/utils/api-error';

interface UpdateCourseVariables {
  cursoId: string;
  payload: AtualizarCursoDto;
}

export function useUpdateCourse() {
  const queryClient =
    useQueryClient();

  return useMutation<
    CursoAtualizado,
    ApiError,
    UpdateCourseVariables
  >({
    mutationFn: ({
      cursoId,
      payload,
    }) =>
      coursesApi.atualizar(
        cursoId,
        payload,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          coursesQueryKeys.lists(),
      });
    },
  });
}