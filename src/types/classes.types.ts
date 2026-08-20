export interface TurmaCurso { id: string; nome: string }

export interface TurmaListada {
  id: string;
  codigo: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  curso: TurmaCurso;
  quantidadeModulos: number;
  quantidadeTarefas: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ListarTurmasParams {
  pagina?: number;
  limite?: number;
  cursoId?: string;
  ativo?: boolean;
}

export interface ListarTurmasResponse {
  data: TurmaListada[];
  meta: { pagina: number; limite: number; total: number; totalPaginas: number };
}

export interface SalvarTurmaDto {
  codigo: string;
  dataInicio: string;
  dataFim: string;
}

export interface CriarTurmaDto extends SalvarTurmaDto { cursoId: string }
export interface AtualizarTurmaDto extends SalvarTurmaDto { cursoId: string }
export interface AlterarStatusTurmaDto { ativo: boolean }
export type TurmaSalva = Omit<TurmaListada, 'quantidadeModulos' | 'quantidadeTarefas'>;
export type TurmaStatusFiltro = '' | 'ATIVAS' | 'INATIVAS';
