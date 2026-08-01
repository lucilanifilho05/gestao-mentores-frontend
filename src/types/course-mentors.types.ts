import type {
  Papel,
} from '@/types/auth.types';

export interface UsuarioVinculoResumo {
  id: string;
  nome: string;
}

export interface MentorVinculadoCurso {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  vinculadoEm: string;

  vinculadoPor: UsuarioVinculoResumo;
}

export interface VincularMentorCursoParams {
  cursoId: string;
  mentorId: string;
}

export interface VincularMentorCursoResponse {
  ok: boolean;
  criado: boolean;

  curso: {
    id: string;
    nome: string;
  };

  mentor: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface DesvincularMentorCursoParams {
  cursoId: string;
  mentorId: string;
}

export interface DesvincularMentorCursoResponse {
  ok: boolean;
  removido: boolean;
}