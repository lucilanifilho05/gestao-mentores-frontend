export type EscopoTarefa = 'curso' | 'turma' | 'evento_macro';
export type StatusTarefa = 'pendente' | 'concluida';
export interface PessoaTarefa { id: string; nome: string; email: string }
export interface TarefaResumo {
  id: string; tipoAtividadeId: string; tipoAtividadeNome: string; titulo: string; descricao: string | null;
  criadoPorId: string; criadoPor: PessoaTarefa; responsavelId: string; responsavel: PessoaTarefa;
  escopo: EscopoTarefa; cursoId: string | null; cursoNome: string | null; turmaId: string | null; turmaCodigo: string | null;
  prazoInicio: string | null; prazoAtual: string; status: StatusTarefa; criadoEm: string; atualizadoEm: string; concluidoEm: string | null; quantidadeReagendamentos: number;
}
export interface AnexoTarefa { id: string; nomeArquivo: string; mimeType: string; tamanhoBytes: number; criadoEm: string; enviadoPor: PessoaTarefa }
export interface ReagendamentoTarefa { id: string; prazoAnterior: string; prazoNovo: string; justificativa: string | null; criadoEm: string; reagendadoPor: PessoaTarefa }
export interface TarefaDetalhe extends TarefaResumo { anexos: AnexoTarefa[]; reagendamentos: ReagendamentoTarefa[] }
export interface ListarTarefasParams { pagina?: number; limite?: number; responsavelId?: string; cursoId?: string; turmaId?: string; status?: StatusTarefa; escopo?: EscopoTarefa }
export interface ListarTarefasResponse { data: TarefaResumo[]; meta: { pagina: number; limite: number; total: number; totalPaginas: number } }
export interface CriarTarefaDto { tipoAtividadeId: string; titulo: string; descricao?: string; responsavelId: string; escopo: EscopoTarefa; cursoId?: string; turmaId?: string; prazoInicio?: string; prazoAtual: string }
export interface TipoAtividade { id: string; nome: string; ativo: boolean; criadoEm?: string; atualizadoEm?: string }
