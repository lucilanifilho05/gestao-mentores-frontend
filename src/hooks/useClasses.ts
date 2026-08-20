import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '@/api/classes.api';
import type { AtualizarTurmaDto, CriarTurmaDto, ListarTurmasParams, SalvarTurmaDto } from '@/types/classes.types';

export const classesQueryKeys = { all: ['turmas'] as const, list: (params: ListarTurmasParams) => ['turmas', 'lista', params] as const };

export function useClasses(params: ListarTurmasParams) {
  return useQuery({ queryKey: classesQueryKeys.list(params), queryFn: () => classesApi.listar(params), placeholderData: (previous) => previous });
}

function useInvalidateClasses() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: classesQueryKeys.all });
}

export function useCreateClass() {
  const invalidate = useInvalidateClasses();
  return useMutation({ mutationFn: (payload: CriarTurmaDto) => classesApi.criar(payload), onSuccess: invalidate });
}

export function useUpdateClass() {
  const invalidate = useInvalidateClasses();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: AtualizarTurmaDto }) => classesApi.atualizar(id, payload), onSuccess: invalidate });
}

export function useCloneClass() {
  const invalidate = useInvalidateClasses();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: SalvarTurmaDto }) => classesApi.clonar(id, payload), onSuccess: invalidate });
}

export function useChangeClassStatus() {
  const invalidate = useInvalidateClasses();
  return useMutation({ mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => classesApi.alterarStatus(id, { ativo }), onSuccess: invalidate });
}
