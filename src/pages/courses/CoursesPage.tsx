import {
  useState,
} from 'react';

import {
  BookOpen,
  Plus,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  CourseFilters,
} from '@/components/courses/CourseFilters';

import {
  CoursesTable,
  CoursesTableSkeleton,
} from '@/components/courses/CoursesTable';

import {
  CreateCourseDialog,
} from '@/components/courses/CreateCourseDialog';

import {
  EditCourseDialog,
} from '@/components/courses/EditCourseDialog';

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
  Pagination,
} from '@/components/ui/Pagination';

import {
  useAuth,
} from '@/hooks/useAuth';

import {
  useChangeCourseStatus,
} from '@/hooks/useChangeCourseStatus';

import {
  useCourses,
} from '@/hooks/useCourses';

import type {
  CursoAtualizado,
  CursoCriado,
  CursoListado,
  CursoStatusFiltro,
} from '@/types/courses.types';

import {
  getErrorMessage,
} from '@/utils/api-error';

const PAGE_SIZE = 20;

function converterStatusParaAtivo(
  status: CursoStatusFiltro,
): boolean | undefined {
  if (status === 'ATIVOS') {
    return true;
  }

  if (status === 'INATIVOS') {
    return false;
  }

  return undefined;
}

export function CoursesPage(): JSX.Element {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const isCoordinator =
    user?.papel ===
    'COORDENADORA';

  const isMentor =
    user?.papel ===
    'MENTOR';

  const changeStatusMutation =
    useChangeCourseStatus();

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    draftSearch,
    setDraftSearch,
  ] = useState('');

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState('');

  const [
    draftStatus,
    setDraftStatus,
  ] = useState<CursoStatusFiltro>(
    '',
  );

  const [
    appliedStatus,
    setAppliedStatus,
  ] = useState<CursoStatusFiltro>(
    '',
  );

  const [
    createDialogOpen,
    setCreateDialogOpen,
  ] = useState(false);

  const [
    editTarget,
    setEditTarget,
  ] = useState<CursoListado | null>(
    null,
  );

  const [
    statusTarget,
    setStatusTarget,
  ] = useState<CursoListado | null>(
    null,
  );

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

  const coursesQuery =
    useCourses({
      pagina: page,
      limite: PAGE_SIZE,

      busca:
        appliedSearch ||
        undefined,

      apenas_meus:
        isMentor,

      ativo:
        converterStatusParaAtivo(
          appliedStatus,
        ),
    });

  const response =
    coursesQuery.data;

  const courses =
    response?.data ?? [];

  function clearMessages(): void {
    setSuccessMessage(null);
    setErrorMessage(null);
  }

  function applyFilters(): void {
    setPage(1);

    setAppliedSearch(
      draftSearch.trim(),
    );

    setAppliedStatus(
      draftStatus,
    );
  }

  function clearFilters(): void {
    setPage(1);

    setDraftSearch('');
    setAppliedSearch('');

    setDraftStatus('');
    setAppliedStatus('');
  }

  function handleCourseCreated(
    course: CursoCriado,
  ): void {
    setPage(1);

    setErrorMessage(null);

    setSuccessMessage(
      `${course.nome} foi cadastrado com sucesso.`,
    );

    setCreateDialogOpen(false);
  }

  function handleCourseUpdated(
    course: CursoAtualizado,
  ): void {
    setErrorMessage(null);

    setSuccessMessage(
      `${course.nome} foi atualizado com sucesso.`,
    );

    setEditTarget(null);
  }

  async function confirmStatusChange(): Promise<void> {
    if (!statusTarget) {
      return;
    }

    const target =
      statusTarget;

    clearMessages();

    try {
      const updatedCourse =
        await changeStatusMutation
          .mutateAsync({
            cursoId:
              target.id,

            ativo:
              !target.ativo,
          });

      setSuccessMessage(
        `${updatedCourse.nome} foi ${
          updatedCourse.ativo
            ? 'ativado'
            : 'desativado'
        } com sucesso.`,
      );

      setStatusTarget(null);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error),
      );

      setStatusTarget(null);
    }
  }

  function openCreateDialog(): void {
    clearMessages();
    setCreateDialogOpen(true);
  }

  function openEditDialog(
    course: CursoListado,
  ): void {
    clearMessages();
    setEditTarget(course);
  }

  function openStatusDialog(
    course: CursoListado,
  ): void {
    clearMessages();
    setStatusTarget(course);
  }

  function openCourseMentors(
    course: CursoListado,
  ): void {
    /*
     * Proteção visual adicional.
     * O backend não permite consultar
     * vínculos de cursos inativos.
     */
    if (!course.ativo) {
      setSuccessMessage(null);

      setErrorMessage(
        'Ative o curso antes de gerenciar seus mentores.',
      );

      return;
    }

    navigate(
      `/cursos/${course.id}/mentores`,
      {
        state: {
          courseName:
            course.nome,
        },
      },
    );
  }

  const hasAppliedFilters =
    Boolean(
      appliedSearch ||
      appliedStatus,
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold gm-text-primary">
            Catálogo acadêmico
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Cursos
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {isCoordinator
              ? 'Consulte, cadastre e gerencie os cursos utilizados na organização de turmas, mentores e atividades.'
              : 'Consulte os cursos aos quais você está vinculado.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {response ? (
            <div className="rounded-xl border gm-border bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cursos encontrados
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {response.meta.total}
              </p>
            </div>
          ) : null}

          {isCoordinator ? (
            <Button
              type="button"
              onClick={
                openCreateDialog
              }
            >
              <Plus
                aria-hidden="true"
                className="h-4 w-4"
              />

              Cadastrar curso
            </Button>
          ) : null}
        </div>
      </section>

      {successMessage ? (
        <Alert
          variant="success"
          title="Operação concluída"
        >
          {successMessage}
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert
          variant="error"
          title="Não foi possível atualizar o curso"
        >
          {errorMessage}
        </Alert>
      ) : null}

      <section className="gm-panel p-5 sm:p-6">
        <CourseFilters
          search={draftSearch}
          status={draftStatus}
          isLoading={
            coursesQuery.isFetching
          }
          onSearchChange={
            setDraftSearch
          }
          onStatusChange={
            setDraftStatus
          }
          onSubmit={
            applyFilters
          }
          onClear={
            clearFilters
          }
        />
      </section>

      <section className="gm-panel overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b gm-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-slate-950">
              {isCoordinator
                ? 'Cursos cadastrados'
                : 'Meus cursos'}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasAppliedFilters
                ? 'Resultado dos filtros aplicados.'
                : 'Cursos carregados diretamente da API.'}
            </p>
          </div>

          {coursesQuery.isFetching &&
          !coursesQuery.isLoading ? (
            <span className="text-xs font-semibold gm-text-primary">
              Atualizando…
            </span>
          ) : null}
        </div>

        {coursesQuery.isLoading ? (
          <CoursesTableSkeleton
            showActions={
              isCoordinator
            }
          />
        ) : null}

        {coursesQuery.isError ? (
          <div className="space-y-4 p-5 sm:p-6">
            <Alert
              variant="error"
              title="Não foi possível carregar os cursos"
            >
              {getErrorMessage(
                coursesQuery.error,
              )}
            </Alert>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void coursesQuery.refetch();
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {!coursesQuery.isLoading &&
        !coursesQuery.isError &&
        courses.length === 0 ? (
          <EmptyState
            icon={
              <BookOpen
                aria-hidden="true"
                className="h-7 w-7"
              />
            }
            title="Nenhum curso encontrado"
            description={
              hasAppliedFilters
                ? 'Nenhum curso corresponde aos filtros informados.'
                : isCoordinator
                  ? 'Cadastre o primeiro curso para iniciar a estrutura acadêmica.'
                  : 'Você ainda não possui cursos vinculados.'
            }
          />
        ) : null}

        {!coursesQuery.isLoading &&
        !coursesQuery.isError &&
        courses.length > 0 ? (
          <>
            <CoursesTable
              courses={courses}
              canManageCourses={
                isCoordinator
              }
              actionDisabled={
                changeStatusMutation
                  .isPending
              }
              onEdit={
                openEditDialog
              }
              onRequestStatusChange={
                openStatusDialog
              }
              onManageMentors={
                openCourseMentors
              }
            />

            <Pagination
              page={page}
              totalPages={
                response?.meta
                  .totalPaginas ?? 0
              }
              disabled={
                coursesQuery.isFetching ||
                changeStatusMutation
                  .isPending
              }
              onPageChange={
                setPage
              }
            />
          </>
        ) : null}
      </section>

      {isCoordinator ? (
        <>
          <CreateCourseDialog
            open={
              createDialogOpen
            }
            onClose={() => {
              setCreateDialogOpen(
                false,
              );
            }}
            onCreated={
              handleCourseCreated
            }
          />

          <EditCourseDialog
            open={
              editTarget !== null
            }
            course={
              editTarget
            }
            onClose={() => {
              setEditTarget(null);
            }}
            onUpdated={
              handleCourseUpdated
            }
          />

          <ConfirmDialog
            open={
              statusTarget !== null
            }
            title={
              statusTarget?.ativo
                ? 'Desativar curso?'
                : 'Ativar curso?'
            }
            description={
              statusTarget?.ativo
                ? `O curso ${statusTarget.nome} deixará de aceitar novas turmas, vínculos e tarefas. Turmas, tarefas e vínculos existentes serão preservados.`
                : `O curso ${statusTarget?.nome ?? ''} voltará a aceitar turmas, vínculos e tarefas conforme as regras do sistema.`
            }
            confirmLabel={
              statusTarget?.ativo
                ? 'Desativar curso'
                : 'Ativar curso'
            }
            isLoading={
              changeStatusMutation
                .isPending
            }
            onClose={() => {
              if (
                !changeStatusMutation
                  .isPending
              ) {
                setStatusTarget(null);
              }
            }}
            onConfirm={() => {
              void confirmStatusChange();
            }}
          />
        </>
      ) : null}
    </div>
  );
}