import { apiRequest } from "@/api/client";
import type {
  CriarTarefaDto,
  AtualizarTarefaDto,
  CriarTarefaResponse,
  ListarTarefasParams,
  ListarTarefasResponse,
  TarefaDetalhe,
  ComentarioTarefa,
  TipoAtividade,
} from "@/types/tasks.types";

function query(params: ListarTarefasParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") q.set(key, String(value));
  });
  const text = q.toString();
  return text ? `?${text}` : "";
}
export const tasksApi = {
  listar: (params: ListarTarefasParams) =>
    apiRequest<ListarTarefasResponse>(`/tarefas${query(params)}`),
  buscar: (id: string) =>
    apiRequest<TarefaDetalhe>(`/tarefas/${encodeURIComponent(id)}`),
  criar: (payload: CriarTarefaDto) =>
    apiRequest<CriarTarefaResponse>("/tarefas", { method: "POST", body: payload }),
  atualizar: (id: string, payload: AtualizarTarefaDto) =>
    apiRequest<TarefaDetalhe>(`/tarefas/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: payload,
    }),
  concluir: (id: string) =>
    apiRequest<TarefaDetalhe>(`/tarefas/${encodeURIComponent(id)}/concluir`, {
      method: "POST",
    }),
  iniciar: (id: string) =>
    apiRequest<TarefaDetalhe>(`/tarefas/${encodeURIComponent(id)}/iniciar`, {
      method: "POST",
    }),
  reagendar: (id: string, prazoNovo: string, justificativa?: string) =>
    apiRequest<TarefaDetalhe>(`/tarefas/${encodeURIComponent(id)}/reagendar`, {
      method: "POST",
      body: { prazoNovo, justificativa: justificativa || undefined },
    }),
  adicionarComentario: (id: string, conteudo: string) =>
    apiRequest<ComentarioTarefa>(`/tarefas/${encodeURIComponent(id)}/comentarios`, {
      method: "POST",
      body: { conteudo },
    }),
  marcarComentariosComoLidos: (id: string) =>
    apiRequest<{ quantidadeMarcada: number }>(`/tarefas/${encodeURIComponent(id)}/comentarios/marcar-lidos`, {
      method: "POST",
    }),
  quantidadeComentariosNaoLidos: () =>
    apiRequest<{ quantidade: number }>("/tarefas/comentarios/nao-lidos/quantidade"),
  listarTipos: (ativo?: boolean) =>
    apiRequest<{ data: TipoAtividade[]; meta: { total: number } }>(
      `/tipos-atividade?pagina=1&limite=100${ativo !== undefined ? `&ativo=${ativo}` : ""}`,
    ),
  criarTipo: (nome: string) =>
    apiRequest<TipoAtividade>("/tipos-atividade", {
      method: "POST",
      body: { nome },
    }),
  atualizarTipo: (id: string, nome: string) =>
    apiRequest<TipoAtividade>(`/tipos-atividade/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { nome },
    }),
  alterarStatusTipo: (id: string, ativo: boolean) =>
    apiRequest<TipoAtividade>(
      `/tipos-atividade/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: { ativo } },
    ),
};
