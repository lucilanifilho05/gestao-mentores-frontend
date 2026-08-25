import type {
  Papel,
} from '@/types/auth.types';

export interface UsuarioListado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  ultimoLoginEm: string | null;
  criadoEm: string;
}

export interface UsuariosPaginacaoMeta {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface ListarUsuariosParams {
  pagina?: number;
  limite?: number;
  busca?: string;
  papel?: Papel;
  ativo?: boolean;
}

export interface ListarUsuariosResponse {
  data: UsuarioListado[];
  meta: UsuariosPaginacaoMeta;
}

export type UsuarioStatusFiltro =
  | ''
  | 'ATIVOS'
  | 'INATIVOS';

export interface UsuariosFiltrosValue {
  busca: string;
  papel: Papel | '';
  status: UsuarioStatusFiltro;
}

/* Cadastro */

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  senha: string;
  papel?: Papel;
}

export interface UsuarioCriado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

/* Alteração de status */

export interface AlterarStatusUsuarioDto {
  ativo: boolean;
}

export interface AlterarStatusUsuarioParams {
  usuarioId: string;
  ativo: boolean;
}

export interface UsuarioStatusAtualizado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AtualizarPerfilUsuarioDto {
  nome: string;
  email: string;
}

export interface AlterarPropriaSenhaDto {
  senhaAtual: string;
  novaSenha: string;
}

export interface RedefinirSenhaUsuarioDto {
  novaSenha: string;
}
