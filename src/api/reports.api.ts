import { apiRequest } from "@/api/client";
import type {
  EscopoTarefa,
  PessoaTarefa,
  StatusTarefa,
} from "@/types/tasks.types";

export interface DashboardTask {
  id: string;
  titulo: string;
  projeto: { id: string; nome: string };
  descricao: string | null;
  tipoAtividade: { id: string; nome: string };
  responsavel: PessoaTarefa;
  criadoPor: PessoaTarefa;
  escopo: EscopoTarefa;
  curso: { id: string; nome: string } | null;
  turma: { id: string; codigo: string } | null;
  prazoInicio: string | null;
  prazoAtual: string;
  status: StatusTarefa;
  quantidadeReagendamentos: number;
  quantidadeLinks: number;
  criadoEm: string;
  concluidoEm: string | null;
}
export interface DashboardFilters {
  inicio?: string;
  fim?: string;
  mentorId?: string;
  cursoId?: string;
  turmaId?: string;
  tipoAtividadeId?: string;
}

function queryString(filters: DashboardFilters): string {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}
export const reportsApi = {
  tasks: (filters: DashboardFilters) =>
    apiRequest<DashboardTask[]>(`/relatorios/tarefas${queryString(filters)}`),
  excel: (filters: DashboardFilters) =>
    apiRequest<Blob>(`/relatorios/tarefas/excel${queryString(filters)}`, {
      responseType: "blob",
    }),
  pdf: (filters: DashboardFilters) =>
    apiRequest<Blob>(`/relatorios/tarefas/pdf${queryString(filters)}`, {
      responseType: "blob",
    }),
};
