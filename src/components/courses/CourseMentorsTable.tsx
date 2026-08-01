import {
  UserMinus,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/Button';

import type {
  MentorVinculadoCurso,
} from '@/types/course-mentors.types';

interface CourseMentorsTableProps {
  mentors: MentorVinculadoCurso[];
  disabled?: boolean;

  onRequestUnlink: (
    mentor: MentorVinculadoCurso,
  ) => void;
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  ).format(date);
}

export function CourseMentorsTable({
  mentors,
  disabled = false,
  onRequestUnlink,
}: CourseMentorsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b gm-border bg-slate-50/80 text-left">
            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Mentor
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Vinculado em
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Vinculado por
            </th>

            <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {mentors.map((mentor) => (
            <tr
              key={mentor.id}
              className="border-b gm-border last:border-b-0 hover:bg-slate-50/60"
            >
              <td className="px-5 py-4">
                <p className="font-semibold text-slate-950">
                  {mentor.nome}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {mentor.email}
                </p>
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                {formatDateTime(
                  mentor.vinculadoEm,
                )}
              </td>

              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-slate-700">
                  {
                    mentor.vinculadoPor
                      .nome
                  }
                </p>
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-right">
                <Button
                  variant="danger"
                  disabled={disabled}
                  onClick={() => {
                    onRequestUnlink(
                      mentor,
                    );
                  }}
                >
                  <UserMinus
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  Desvincular
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CourseMentorsTableSkeleton(): JSX.Element {
  return (
    <div
      aria-label="Carregando mentores vinculados"
      className="overflow-hidden"
    >
      <div className="h-12 animate-pulse border-b gm-border bg-slate-100" />

      {Array.from(
        {
          length: 4,
        },
        (_, index) => (
          <div
            key={index}
            className="grid min-h-20 animate-pulse grid-cols-[2fr_1fr_1fr_1fr] items-center gap-6 border-b gm-border px-5 last:border-b-0"
          >
            <div>
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
            </div>

            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="ml-auto h-9 w-28 rounded-lg bg-slate-100" />
          </div>
        ),
      )}
    </div>
  );
}