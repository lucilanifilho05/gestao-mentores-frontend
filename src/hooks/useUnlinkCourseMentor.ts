import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  coursesApi,
} from '@/api/courses.api';

import {
  courseMentorsQueryKeys,
} from '@/hooks/useCourseMentors';

import {
  coursesQueryKeys,
} from '@/hooks/useCourses';

import type {
  DesvincularMentorCursoParams,
  DesvincularMentorCursoResponse,
} from '@/types/course-mentors.types';

import type {
  ApiError,
} from '@/utils/api-error';

export function useUnlinkCourseMentor() {
  const queryClient =
    useQueryClient();

  return useMutation<
    DesvincularMentorCursoResponse,
    ApiError,
    DesvincularMentorCursoParams
  >({
    mutationFn: ({
      cursoId,
      mentorId,
    }) =>
      coursesApi.desvincularMentor(
        cursoId,
        mentorId,
      ),

    onSuccess: async (
      _response,
      variables,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            courseMentorsQueryKeys
              .list(
                variables.cursoId,
              ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            coursesQueryKeys.lists(),
        }),
      ]);
    },
  });
}