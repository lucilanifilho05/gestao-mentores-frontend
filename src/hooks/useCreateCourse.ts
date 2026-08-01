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
  CriarCursoDto,
  CursoCriado,
} from '@/types/courses.types';

import type {
  ApiError,
} from '@/utils/api-error';

export function useCreateCourse() {
  const queryClient =
    useQueryClient();

  return useMutation<
    CursoCriado,
    ApiError,
    CriarCursoDto
  >({
    mutationFn: (
      payload: CriarCursoDto,
    ) => coursesApi.criar(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          coursesQueryKeys.lists(),
      });
    },
  });
}