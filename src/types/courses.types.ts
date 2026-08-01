export interface CursoListado {
  id: string;
  nome: string;
  ativo: boolean;
  quantidadeMentores: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CursosPaginacaoMeta {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface ListarCursosParams {
  pagina?: number;
  limite?: number;
  busca?: string;
  apenas_meus?: boolean;
  ativo?: boolean;
}

export interface ListarCursosResponse {
  data: CursoListado[];
  meta: CursosPaginacaoMeta;
}

export interface CriarCursoDto {
  nome: string;
}

export interface AtualizarCursoDto {
  nome: string;
}

export interface AlterarStatusCursoDto {
  ativo: boolean;
}

export interface CursoCriado {
  id: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CursoAtualizado {
  id: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AlterarStatusCursoParams {
  cursoId: string;
  ativo: boolean;
}

export type CursoStatusFiltro =
  | ''
  | 'ATIVOS'
  | 'INATIVOS';