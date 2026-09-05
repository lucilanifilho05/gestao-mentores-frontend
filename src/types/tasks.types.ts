export type EscopoTarefa = "curso" | "turma" | "evento_macro";
export type StatusTarefa = "planejada" | "em_andamento" | "atrasada" | "concluida";
export interface PessoaTarefa {
  id: string;
  nome: string;
  email: string;
}
export interface TarefaResumo {
  id: string;
  numero: number;
  projetoId: string;
  projetoNome: string;
  tipoAtividadeId: string;
  tipoAtividadeNome: string;
  titulo: string;
  descricao: string | null;
  criadoPorId: string;
  criadoPor: PessoaTarefa;
  responsavelId: string;
  responsavel: PessoaTarefa;
  escopo: EscopoTarefa;
  cursoId: string | null;
  cursoNome: string | null;
  turmaId: string | null;
  turmaCodigo: string | null;
  prazoInicio: string | null;
  prazoAtual: string;
  status: StatusTarefa;
  criadoEm: string;
  atualizadoEm: string;
  concluidoEm: string | null;
  iniciadoEm: string | null;
  quantidadeReagendamentos: number;
  quantidadeComentarios: number;
  possuiComentarioNaoLido: boolean;
  links: string[];
}
export interface CriarTarefasMacroResponse {
  quantidadeCriada: number;
  titulo: string;
  tarefas: TarefaDetalhe[];
}
export type CriarTarefaResponse = TarefaDetalhe | CriarTarefasMacroResponse;
export interface ReagendamentoTarefa {
  id: string;
  prazoAnterior: string;
  prazoNovo: string;
  justificativa: string | null;
  criadoEm: string;
  reagendadoPor: PessoaTarefa;
}
export interface TarefaDetalhe extends TarefaResumo {
  reagendamentos: ReagendamentoTarefa[];
  comentarios: ComentarioTarefa[];
}
export interface ComentarioTarefa {
  id: string;
  conteudo: string;
  criadoEm: string;
  lidoEm: string | null;
  autor: PessoaTarefa;
}
export interface ListarTarefasParams {
  numero?: number;
  projetoId?: string;
  inicio?: string;
  fim?: string;
  pagina?: number;
  limite?: number;
  responsavelId?: string;
  cursoId?: string;
  turmaId?: string;
  tipoAtividadeId?: string;
  status?: StatusTarefa;
  escopo?: EscopoTarefa;
}
export interface ListarTarefasResponse {
  data: TarefaResumo[];
  meta: { pagina: number; limite: number; total: number; totalPaginas: number };
}
export interface CriarTarefaDto {
  projetoId: string;
  tipoAtividadeId: string;
  titulo: string;
  descricao?: string;
  responsavelId?: string;
  responsavelIds?: string[];
  escopo: EscopoTarefa;
  cursoId?: string;
  turmaId?: string;
  prazoInicio?: string;
  prazoAtual: string;
  links?: string[];
}
export interface AtualizarTarefaDto {
  tipoAtividadeId: string;
  titulo: string;
  descricao?: string;
  links?: string[];
}
export interface TipoAtividade {
  id: string;
  nome: string;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}
