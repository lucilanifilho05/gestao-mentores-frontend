import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { usersApi } from '@/api/users.api';
import {
  usersQueryKeys,
} from '@/hooks/useUsers';

import type {
  AlterarStatusUsuarioParams,
  UsuarioStatusAtualizado,
} from '@/types/users.types';

import type {
  ApiError,
} from '@/utils/api-error';

export function useChangeUserStatus() {
  const queryClient =
    useQueryClient();

  return useMutation<
    UsuarioStatusAtualizado,
    ApiError,
    AlterarStatusUsuarioParams
  >({
    mutationFn: ({
      usuarioId,
      ativo,
    }) =>
      usersApi.alterarStatus(
        usuarioId,
        {
          ativo,
        },
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          usersQueryKeys.lists(),
      });
    },
  });
}