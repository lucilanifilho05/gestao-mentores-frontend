import {
  useState,
} from 'react';

import {
  ArrowLeft,
  UsersRound,
} from 'lucide-react';

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  CourseMentorSelector,
} from '@/components/courses/CourseMentorSelector';

import {
  CourseMentorsTable,
  CourseMentorsTableSkeleton,
} from '@/components/courses/CourseMentorsTable';

import {
  Alert,
} from '@/components/ui/Alert';

import {
  Button,
} from '@/components/ui/Button';

import {
  ConfirmDialog,
} from '@/components/ui/ConfirmDialog';

import {
  EmptyState,
} from '@/components/ui/EmptyState';

import {
  useCourseMentors,
} from '@/hooks/useCourseMentors';

import {
  useUnlinkCourseMentor,
} from '@/hooks/useUnlinkCourseMentor';

import type {
  MentorVinculadoCurso,
} from '@/types/course-mentors.types';

import {
  getErrorMessage,
} from '@/utils/api-error';

interface CourseNavigationState {
  courseName?: string;
}

function isCourseNavigationState(
  value: unknown,
): value is CourseNavigationState {
  return (
    typeof value === 'object' &&
    value !== null &&
    (
      !('courseName' in value) ||
      typeof value.courseName ===
        'string'
    )
  );
}

export function CourseMentorsPage(): JSX.Element {
  const {
    cursoId,
  } = useParams<{
    cursoId: string;
  }>();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const navigationState =
    isCourseNavigationState(
      location.state,
    )
      ? location.state
      : null;

  const courseName =
    navigationState
      ?.courseName ??
    'Curso selecionado';

  const mentorsQuery =
    useCourseMentors(
      cursoId ?? '',
    );

  const unlinkMutation =
    useUnlinkCourseMentor();

  const [
    unlinkTarget,
    setUnlinkTarget,
  ] = useState<
    MentorVinculadoCurso | null
  >(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  async function confirmUnlink(): Promise<void> {
    if (
      !cursoId ||
      !unlinkTarget
    ) {
      return;
    }

    const target =
      unlinkTarget;

    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response =
        await unlinkMutation
          .mutateAsync({
            cursoId,
            mentorId:
              target.id,
          });

      setSuccessMessage(
        response.removido
          ? `${target.nome} foi desvinculado do curso.`
          : `O vínculo de ${target.nome} já não existia.`,
      );

      setUnlinkTarget(null);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error),
      );

      setUnlinkTarget(null);
    }
  }

  if (!cursoId) {
    return (
      <div className="mx-auto max-w-5xl">
        <Alert
          variant="error"
          title="Curso inválido"
        >
          Não foi possível identificar
          o curso selecionado.
        </Alert>
      </div>
    );
  }

  const mentors =
    mentorsQuery.data ?? [];

  const linkedMentorIds =
    mentors.map(
      (mentor) => mentor.id,
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <Button
          variant="ghost"
          onClick={() => {
            void navigate(
              '/cursos',
            );
          }}
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
          />

          Voltar para cursos
        </Button>

        <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold gm-text-primary">
              Gestão de vínculos
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Mentores do curso
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Gerencie os mentores
              vinculados a{' '}
              <strong className="text-slate-800">
                {courseName}
              </strong>
              .
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Identificador do curso:{' '}
              {cursoId}
            </p>
          </div>

          {!mentorsQuery.isLoading &&
          !mentorsQuery.isError ? (
            <div className="rounded-xl border gm-border bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mentores vinculados
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {mentors.length}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {successMessage ? (
        <Alert
          variant="success"
          title="Vínculo atualizado"
        >
          {successMessage}
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert
          variant="error"
          title="Não foi possível atualizar o vínculo"
        >
          {errorMessage}
        </Alert>
      ) : null}

      <section className="gm-panel overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b gm-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 gm-text-primary">
              <UsersRound
                aria-hidden="true"
                className="h-5 w-5"
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-950">
                Mentores vinculados
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Usuários que podem
                receber atividades
                relacionadas a este
                curso.
              </p>
            </div>
          </div>

          {mentorsQuery.isFetching &&
          !mentorsQuery.isLoading ? (
            <span className="text-xs font-semibold gm-text-primary">
              Atualizando…
            </span>
          ) : null}
        </div>

        {mentorsQuery.isLoading ? (
          <CourseMentorsTableSkeleton />
        ) : null}

        {mentorsQuery.isError ? (
          <div className="space-y-4 p-5 sm:p-6">
            <Alert
              variant="error"
              title="Não foi possível carregar os vínculos"
            >
              {getErrorMessage(
                mentorsQuery.error,
              )}
            </Alert>

            <Button
              variant="secondary"
              onClick={() => {
                void mentorsQuery.refetch();
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {!mentorsQuery.isLoading &&
        !mentorsQuery.isError &&
        mentors.length === 0 ? (
          <EmptyState
            icon={
              <UsersRound
                aria-hidden="true"
                className="h-7 w-7"
              />
            }
            title="Nenhum mentor vinculado"
            description="Busque um mentor ativo na seção abaixo para realizar o primeiro vínculo."
          />
        ) : null}

        {!mentorsQuery.isLoading &&
        !mentorsQuery.isError &&
        mentors.length > 0 ? (
          <CourseMentorsTable
            mentors={mentors}
            disabled={
              unlinkMutation
                .isPending
            }
            onRequestUnlink={
              setUnlinkTarget
            }
          />
        ) : null}
      </section>

      <CourseMentorSelector
        cursoId={cursoId}
        linkedMentorIds={
          linkedMentorIds
        }
      />

      <ConfirmDialog
        open={
          unlinkTarget !== null
        }
        title="Desvincular mentor?"
        description={`${
          unlinkTarget?.nome ?? ''
        } deixará de estar vinculado a este curso. Tarefas e registros existentes não são excluídos por esta operação.`}
        confirmLabel="Desvincular mentor"
        isLoading={
          unlinkMutation.isPending
        }
        onClose={() => {
          if (
            !unlinkMutation
              .isPending
          ) {
            setUnlinkTarget(null);
          }
        }}
        onConfirm={() => {
          void confirmUnlink();
        }}
      />
    </div>
  );
}