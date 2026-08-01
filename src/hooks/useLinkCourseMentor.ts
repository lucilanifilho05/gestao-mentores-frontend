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
  VincularMentorCursoParams,
  VincularMentorCursoResponse,
} from '@/types/course-mentors.types';

import type {
  ApiError,
} from '@/utils/api-error';

export function useLinkCourseMentor() {
  const queryClient =
    useQueryClient();

  return useMutation<
    VincularMentorCursoResponse,
    ApiError,
    VincularMentorCursoParams
  >({
    mutationFn: ({
      cursoId,
      mentorId,
    }) =>
      coursesApi.vincularMentor(
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