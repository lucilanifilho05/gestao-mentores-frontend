import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks.api';
import type { CriarTarefaDto, ListarTarefasParams } from '@/types/tasks.types';
export const tasksKeys = { all: ['tarefas'] as const, list: (params: ListarTarefasParams) => ['tarefas', 'lista', params] as const, detail: (id: string) => ['tarefas', 'detalhe', id] as const };
export function useTasks(params: ListarTarefasParams) { return useQuery({ queryKey: tasksKeys.list(params), queryFn: () => tasksApi.listar(params), placeholderData: (old) => old }); }
export function useTask(id: string | null) { return useQuery({ queryKey: tasksKeys.detail(id ?? ''), queryFn: () => tasksApi.buscar(id!), enabled: Boolean(id) }); }
export function useActivityTypes(onlyActive = true) { return useQuery({ queryKey: ['tipos-atividade', { onlyActive }], queryFn: () => tasksApi.listarTipos(onlyActive ? true : undefined) }); }
export function useCreateActivityType() { const client = useQueryClient(); return useMutation({ mutationFn: (nome: string) => tasksApi.criarTipo(nome), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['tipos-atividade'] }); } }); }
export function useUpdateActivityType() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, nome }: { id: string; nome: string }) => tasksApi.atualizarTipo(id, nome), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['tipos-atividade'] }); } }); }
export function useChangeActivityTypeStatus() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => tasksApi.alterarStatusTipo(id, ativo), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['tipos-atividade'] }); } }); }
function invalidator() { const client = useQueryClient(); return async () => { await client.invalidateQueries({ queryKey: tasksKeys.all }); }; }
export function useCreateTask() { const invalidate = invalidator(); return useMutation({ mutationFn: (payload: CriarTarefaDto) => tasksApi.criar(payload), onSuccess: invalidate }); }
export function useCompleteTask() { const invalidate = invalidator(); return useMutation({ mutationFn: (id: string) => tasksApi.concluir(id), onSuccess: invalidate }); }
export function useRescheduleTask() { const invalidate = invalidator(); return useMutation({ mutationFn: ({ id, prazoNovo, justificativa }: { id: string; prazoNovo: string; justificativa?: string }) => tasksApi.reagendar(id, prazoNovo, justificativa), onSuccess: invalidate }); }
export function useAttachTask() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, file }: { id: string; file: File }) => tasksApi.anexar(id, file), onSuccess: async (_, value) => { await client.invalidateQueries({ queryKey: tasksKeys.detail(value.id) }); } }); }
