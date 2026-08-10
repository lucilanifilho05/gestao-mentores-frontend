import { apiRequest } from "@/api/client";
import type {
  CriarProjetoDto,
  ListarProjetosParams,
  ListarProjetosResponse,
  Projeto,
} from "@/types/projects.types";

function query(params: ListarProjetosParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") q.set(key, String(value));
  });
  const text = q.toString();
  return text ? `?${text}` : "";
}
export const projectsApi = {
  listar: (params: ListarProjetosParams) =>
    apiRequest<ListarProjetosResponse>(`/projetos${query(params)}`),
  buscar: (id: string) =>
    apiRequest<Projeto>(`/projetos/${encodeURIComponent(id)}`),
  criar: (body: CriarProjetoDto) =>
    apiRequest<Projeto>("/projetos", { method: "POST", body }),
  concluir: (id: string) =>
    apiRequest<Projeto>(`/projetos/${encodeURIComponent(id)}/concluir`, {
      method: "POST",
    }),
  cancelar: (id: string) =>
    apiRequest<Projeto>(`/projetos/${encodeURIComponent(id)}/cancelar`, {
      method: "POST",
    }),
};
