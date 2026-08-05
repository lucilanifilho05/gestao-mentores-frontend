import { z } from 'zod';

export const classSchema = z.object({
  codigo: z.string().trim().min(1, 'Informe o código da turma.').max(100, 'Use no máximo 100 caracteres.'),
  dataInicio: z.string().min(1, 'Informe a data de início.'),
  dataFim: z.string().min(1, 'Informe a data de término.'),
}).refine((data) => data.dataFim >= data.dataInicio, { message: 'A data de término deve ser igual ou posterior à data de início.', path: ['dataFim'] });

export type ClassFormData = z.infer<typeof classSchema>;
