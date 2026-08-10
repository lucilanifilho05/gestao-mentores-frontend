import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects.api";
import type {
  CriarProjetoDto,
  ListarProjetosParams,
} from "@/types/projects.types";
export const projectsKeys = {
  all: ["projetos"] as const,
  list: (p: ListarProjetosParams) => ["projetos", "lista", p] as const,
  detail: (id: string) => ["projetos", "detalhe", id] as const,
};
export function useProjects(params: ListarProjetosParams) {
  return useQuery({
    queryKey: projectsKeys.list(params),
    queryFn: () => projectsApi.listar(params),
    placeholderData: (old) => old,
  });
}
export function useProject(id: string | null) {
  return useQuery({
    queryKey: projectsKeys.detail(id ?? ""),
    queryFn: () => projectsApi.buscar(id!),
    enabled: Boolean(id),
  });
}
export function useCreateProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CriarProjetoDto) => projectsApi.criar(body),
    onSuccess: async () =>
      client.invalidateQueries({ queryKey: projectsKeys.all }),
  });
}
export function useConcludeProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.concluir,
    onSuccess: async () =>
      client.invalidateQueries({ queryKey: projectsKeys.all }),
  });
}
export function useCancelProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.cancelar,
    onSuccess: async () =>
      client.invalidateQueries({ queryKey: projectsKeys.all }),
  });
}
