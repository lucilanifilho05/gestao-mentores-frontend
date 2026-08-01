import {
  BookOpen,
  Pencil,
  Power,
  UsersRound,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/Button';

import type {
  CursoListado,
} from '@/types/courses.types';

interface CoursesTableProps {
  courses: CursoListado[];

  canManageCourses?: boolean;
  actionDisabled?: boolean;

  onEdit?: (
    course: CursoListado,
  ) => void;

  onRequestStatusChange?: (
    course: CursoListado,
  ) => void;

  onManageMentors?: (
    course: CursoListado,
  ) => void;
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
    },
  ).format(date);
}

export function CoursesTable({
  courses,
  canManageCourses = false,
  actionDisabled = false,
  onEdit,
  onRequestStatusChange,
  onManageMentors,
}: CoursesTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b gm-border bg-slate-50/80 text-left">
            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Curso
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Mentores vinculados
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Status
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Atualizado em
            </th>

            {canManageCourses ? (
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Ações
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className={`border-b gm-border last:border-b-0 hover:bg-slate-50/60 ${
                course.ativo
                  ? 'bg-white'
                  : 'bg-slate-50/40'
              }`}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      course.ativo
                        ? 'bg-blue-50 gm-text-primary'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <BookOpen
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`font-semibold ${
                        course.ativo
                          ? 'text-slate-950'
                          : 'text-slate-600'
                      }`}
                    >
                      {course.nome}
                    </p>

                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                      Identificador:{' '}
                      {course.id}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <UsersRound
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400"
                  />

                  {course.quantidadeMentores}
                </span>
              </td>

              <td className="px-5 py-4">
                <span
                  className={
                    course.ativo
                      ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
                      : 'inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600'
                  }
                >
                  {course.ativo
                    ? 'Ativo'
                    : 'Inativo'}
                </span>
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                {formatDate(
                  course.atualizadoEm,
                )}
              </td>

              {canManageCourses ? (
                <td className="px-5 py-4">
                  <div className="flex min-w-max flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={
                        actionDisabled
                      }
                      onClick={() => {
                        onEdit?.(course);
                      }}
                    >
                      <Pencil
                        aria-hidden="true"
                        className="h-4 w-4"
                      />

                      Editar
                    </Button>

                    {course.ativo ? (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={
                          actionDisabled
                        }
                        onClick={() => {
                          onManageMentors?.(
                            course,
                          );
                        }}
                      >
                        <UsersRound
                          aria-hidden="true"
                          className="h-4 w-4"
                        />

                        Mentores
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      variant={
                        course.ativo
                          ? 'danger'
                          : 'primary'
                      }
                      disabled={
                        actionDisabled
                      }
                      onClick={() => {
                        onRequestStatusChange?.(
                          course,
                        );
                      }}
                    >
                      <Power
                        aria-hidden="true"
                        className="h-4 w-4"
                      />

                      {course.ativo
                        ? 'Desativar'
                        : 'Ativar'}
                    </Button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CoursesTableSkeletonProps {
  showActions?: boolean;
}

export function CoursesTableSkeleton({
  showActions = false,
}: CoursesTableSkeletonProps): JSX.Element {
  return (
    <div
      aria-label="Carregando cursos"
      aria-busy="true"
      className="overflow-hidden"
    >
      <div className="h-12 animate-pulse border-b gm-border bg-slate-100" />

      {Array.from(
        {
          length: 5,
        },
        (_, index) => (
          <div
            key={index}
            className={`grid min-h-20 animate-pulse items-center gap-6 border-b gm-border px-5 last:border-b-0 ${
              showActions
                ? 'grid-cols-[2fr_1fr_1fr_1fr_2fr]'
                : 'grid-cols-[2fr_1fr_1fr_1fr]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

              <div>
                <div className="h-4 w-48 rounded bg-slate-200" />

                <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
              </div>
            </div>

            <div className="h-4 w-16 rounded bg-slate-100" />

            <div className="h-6 w-16 rounded-full bg-slate-100" />

            <div className="h-4 w-20 rounded bg-slate-100" />

            {showActions ? (
              <div className="ml-auto flex gap-2">
                <div className="h-9 w-20 rounded-lg bg-slate-100" />
                <div className="h-9 w-24 rounded-lg bg-slate-100" />
                <div className="h-9 w-24 rounded-lg bg-slate-100" />
              </div>
            ) : null}
          </div>
        ),
      )}
    </div>
  );
}