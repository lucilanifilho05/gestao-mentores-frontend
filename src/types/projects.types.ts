import type { PessoaTarefa } from "@/types/tasks.types";
export type StatusProjeto =
  "planejamento" | "em_andamento" | "concluido" | "cancelado";
export interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  criadoPorId: string;
  criadoPor: PessoaTarefa;
  dataInicio: string | null;
  prazoFinal: string;
  status: StatusProjeto;
  criadoEm: string;
  atualizadoEm: string;
  concluidoEm: string | null;
  _count: { tarefas: number };
}
export interface CriarProjetoDto {
  nome: string;
  descricao?: string;
  dataInicio?: string;
  prazoFinal: string;
}
export interface ListarProjetosParams {
  pagina?: number;
  limite?: number;
  status?: StatusProjeto;
}
export interface ListarProjetosResponse {
  data: Projeto[];
  meta: { pagina: number; limite: number; total: number; totalPaginas: number };
}
