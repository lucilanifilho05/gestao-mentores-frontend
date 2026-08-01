import {
  useQuery,
} from '@tanstack/react-query';

import { usersApi } from '@/api/users.api';

import type {
  ListarUsuariosParams,
  ListarUsuariosResponse,
} from '@/types/users.types';

export const usersQueryKeys = {
  all: ['usuarios'] as const,

  lists: () =>
    [
      ...usersQueryKeys.all,
      'lista',
    ] as const,

  list: (
    params: ListarUsuariosParams,
  ) =>
    [
      ...usersQueryKeys.lists(),
      params,
    ] as const,
};

export function useUsers(
  params: ListarUsuariosParams,
) {
  return useQuery<ListarUsuariosResponse>({
    queryKey:
      usersQueryKeys.list(params),

    queryFn: () =>
      usersApi.listar(params),

    placeholderData: (
      previousData,
    ) => previousData,
  });
}