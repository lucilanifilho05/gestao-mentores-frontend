import {
  useMemo,
  useState,
} from 'react';

import {
  Search,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react';

import {
  Alert,
} from '@/components/ui/Alert';

import {
  Button,
} from '@/components/ui/Button';

import {
  Pagination,
} from '@/components/ui/Pagination';

import {
  useLinkCourseMentor,
} from '@/hooks/useLinkCourseMentor';

import {
  useUsers,
} from '@/hooks/useUsers';

import type {
  UsuarioListado,
} from '@/types/users.types';

import {
  getErrorMessage,
} from '@/utils/api-error';

interface CourseMentorSelectorProps {
  cursoId: string;
  linkedMentorIds: string[];
}

const PAGE_SIZE = 20;

export function CourseMentorSelector({
  cursoId,
  linkedMentorIds,
}: CourseMentorSelectorProps): JSX.Element {
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

  const linkMutation =
    useLinkCourseMentor();

  const usersQuery =
    useUsers({
      pagina: page,
      limite: PAGE_SIZE,

      busca:
        appliedSearch ||
        undefined,

      papel: 'MENTOR',
      ativo: true,
    });

  const linkedIds = useMemo(
    () =>
      new Set(
        linkedMentorIds,
      ),
    [
      linkedMentorIds,
    ],
  );

  const availableMentors =
    useMemo(
      () =>
        (
          usersQuery.data?.data ??
          []
        ).filter(
          (mentor) =>
            !linkedIds.has(
              mentor.id,
            ),
        ),
      [
        linkedIds,
        usersQuery.data,
      ],
    );

  function applySearch(): void {
    setPage(1);

    setAppliedSearch(
      draftSearch.trim(),
    );
  }

  function clearSearch(): void {
    setPage(1);
    setDraftSearch('');
    setAppliedSearch('');
  }

  async function linkMentor(
    mentor: UsuarioListado,
  ): Promise<void> {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response =
        await linkMutation
          .mutateAsync({
            cursoId,
            mentorId:
              mentor.id,
          });

      setSuccessMessage(
        response.criado
          ? `${response.mentor.nome} foi vinculado ao curso.`
          : `${response.mentor.nome} já estava vinculado ao curso.`,
      );
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error),
      );
    }
  }

  const response =
    usersQuery.data;

  const currentMutationMentorId =
    linkMutation.variables
      ?.mentorId;

  return (
    <section className="gm-panel overflow-hidden">
      <div className="border-b gm-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 gm-text-primary">
            <UserPlus
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              Adicionar mentor
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Somente mentores ativos
              podem ser vinculados.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
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
            title="Não foi possível vincular o mentor"
          >
            {errorMessage}
          </Alert>
        ) : null}

        <form
          className="flex flex-col gap-3 md:flex-row md:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
        >
          <label className="block flex-1">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Buscar mentor
            </span>

            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                className="gm-input gm-input-leading"
                maxLength={100}
                placeholder="Nome ou e-mail do mentor"
                value={draftSearch}
                onChange={(event) => {
                  setDraftSearch(
                    event.target.value,
                  );
                }}
              />
            </div>
          </label>

          <div className="flex gap-2">
            <Button
              type="submit"
              isLoading={
                usersQuery.isFetching
              }
            >
              Buscar
            </Button>

            {draftSearch ||
            appliedSearch ? (
              <Button
                type="button"
                variant="secondary"
                disabled={
                  usersQuery
                    .isFetching
                }
                onClick={clearSearch}
              >
                <X
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Limpar
              </Button>
            ) : null}
          </div>
        </form>

        {usersQuery.isError ? (
          <div className="space-y-3">
            <Alert
              variant="error"
              title="Não foi possível carregar os mentores"
            >
              {getErrorMessage(
                usersQuery.error,
              )}
            </Alert>

            <Button
              variant="secondary"
              onClick={() => {
                void usersQuery.refetch();
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {usersQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from(
              {
                length: 4,
              },
              (_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl border gm-border bg-slate-50"
                />
              ),
            )}
          </div>
        ) : null}

        {!usersQuery.isLoading &&
        !usersQuery.isError &&
        availableMentors.length ===
          0 ? (
          <div className="rounded-xl border border-dashed gm-border bg-slate-50 px-5 py-8 text-center">
            <UsersRound
              aria-hidden="true"
              className="mx-auto h-8 w-8 text-slate-400"
            />

            <p className="mt-3 font-semibold text-slate-800">
              Nenhum mentor disponível
              nesta página
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Os mentores encontrados
              já estão vinculados ou não
              correspondem à busca.
            </p>
          </div>
        ) : null}

        {!usersQuery.isLoading &&
        !usersQuery.isError &&
        availableMentors.length >
          0 ? (
          <div className="divide-y gm-border overflow-hidden rounded-xl border gm-border">
            {availableMentors.map(
              (mentor) => {
                const isCurrentMutation =
                  linkMutation
                    .isPending &&
                  currentMutationMentorId ===
                    mentor.id;

                return (
                  <div
                    key={mentor.id}
                    className="flex flex-col justify-between gap-4 bg-white px-4 py-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {mentor.nome}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {mentor.email}
                      </p>
                    </div>

                    <Button
                      isLoading={
                        isCurrentMutation
                      }
                      disabled={
                        linkMutation
                          .isPending &&
                        !isCurrentMutation
                      }
                      onClick={() => {
                        void linkMentor(
                          mentor,
                        );
                      }}
                    >
                      <UserPlus
                        aria-hidden="true"
                        className="h-4 w-4"
                      />

                      Vincular
                    </Button>
                  </div>
                );
              },
            )}
          </div>
        ) : null}
      </div>

      {!usersQuery.isError ? (
        <Pagination
          page={page}
          totalPages={
            response?.meta
              .totalPaginas ?? 0
          }
          disabled={
            usersQuery.isFetching ||
            linkMutation.isPending
          }
          onPageChange={
            setPage
          }
        />
      ) : null}
    </section>
  );
}
