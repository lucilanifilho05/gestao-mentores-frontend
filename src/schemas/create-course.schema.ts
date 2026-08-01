import { z } from 'zod';

export const createCourseSchema =
  z.object({
    nome: z
      .string()
      .trim()
      .min(
        2,
        'O nome deve possuir pelo menos 2 caracteres.',
      )
      .max(
        150,
        'O nome deve possuir no máximo 150 caracteres.',
      )
      .transform((value) =>
        value.replace(/\s+/g, ' '),
      ),
  });

export type CreateCourseFormInput =
  z.input<
    typeof createCourseSchema
  >;

export type CreateCourseFormData =
  z.output<
    typeof createCourseSchema
  >;