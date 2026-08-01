import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const createUserSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(
      3,
      'O nome deve possuir pelo menos 3 caracteres.',
    )
    .max(
      150,
      'O nome deve possuir no máximo 150 caracteres.',
    ),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(
      254,
      'O e-mail deve possuir no máximo 254 caracteres.',
    )
    .email(
      'Informe um endereço de e-mail válido.',
    ),

  senha: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `A senha deve possuir pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    )
    .max(
      PASSWORD_MAX_LENGTH,
      `A senha deve possuir no máximo ${PASSWORD_MAX_LENGTH} caracteres.`,
    ),

  papel: z.union([
    z.literal('COORDENADORA'),
    z.literal('MENTOR'),
  ]),
});

export type CreateUserFormInput =
  z.input<typeof createUserSchema>;

export type CreateUserFormData =
  z.output<typeof createUserSchema>;