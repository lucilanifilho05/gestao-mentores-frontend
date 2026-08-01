import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { usersApi } from '@/api/users.api';
import {
  usersQueryKeys,
} from '@/hooks/useUsers';

import type {
  CriarUsuarioDto,
  UsuarioCriado,
} from '@/types/users.types';

import type {
  ApiError,
} from '@/utils/api-error';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    UsuarioCriado,
    ApiError,
    CriarUsuarioDto
  >({
    mutationFn: (
      payload: CriarUsuarioDto,
    ) => usersApi.criar(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          usersQueryKeys.lists(),
      });
    },
  });
}