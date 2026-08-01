export type Papel = 'COORDENADORA' | 'MENTOR';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  usuario: UsuarioAutenticado;
}
