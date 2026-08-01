import {
  useQuery,
} from '@tanstack/react-query';

import {
  coursesApi,
} from '@/api/courses.api';

import type {
  MentorVinculadoCurso,
} from '@/types/course-mentors.types';

export const courseMentorsQueryKeys = {
  all: [
    'cursos',
    'mentores',
  ] as const,

  list: (
    cursoId: string,
  ) =>
    [
      ...courseMentorsQueryKeys.all,
      cursoId,
    ] as const,
};

export function useCourseMentors(
  cursoId: string,
) {
  return useQuery<
    MentorVinculadoCurso[]
  >({
    queryKey:
      courseMentorsQueryKeys.list(
        cursoId,
      ),

    queryFn: () =>
      coursesApi.listarMentores(
        cursoId,
      ),

    enabled:
      Boolean(cursoId),
  });
}