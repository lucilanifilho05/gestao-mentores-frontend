import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { usersQueryKeys } from '@/hooks/useUsers';
import type { AlterarPropriaSenhaDto, AtualizarPerfilUsuarioDto, RedefinirSenhaUsuarioDto } from '@/types/users.types';

export function useUpdateMyProfile() {
  return useMutation({ mutationFn: (payload: AtualizarPerfilUsuarioDto) => usersApi.atualizarMeuPerfil(payload) });
}

export function useChangeMyPassword() {
  return useMutation({ mutationFn: (payload: AlterarPropriaSenhaDto) => usersApi.alterarMinhaSenha(payload) });
}

export function useUpdateMentor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, payload }: { usuarioId: string; payload: AtualizarPerfilUsuarioDto }) => usersApi.atualizarMentor(usuarioId, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: usersQueryKeys.lists() }),
  });
}

export function useResetMentorPassword() {
  return useMutation({
    mutationFn: ({ usuarioId, payload }: { usuarioId: string; payload: RedefinirSenhaUsuarioDto }) => usersApi.redefinirSenhaMentor(usuarioId, payload),
  });
}
