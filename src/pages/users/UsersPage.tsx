import { useState } from 'react';

import {
    ConfirmDialog,
} from '@/components/ui/ConfirmDialog';

import {
    useAuth,
} from '@/hooks/useAuth';

import {
    useChangeUserStatus,
} from '@/hooks/useChangeUserStatus';

import {
    CreateUserDialog,
} from '@/components/users/CreateUserDialog';

import {
    ShieldCheck,
    UserPlus,
    UsersRound,
} from 'lucide-react';

import {
    UserFilters,
} from '@/components/users/UserFilters';

import {
    UsersTable,
    UsersTableSkeleton,
} from '@/components/users/UsersTable';

import {
    Alert,
} from '@/components/ui/Alert';

import {
    Button,
} from '@/components/ui/Button';

import {
    EmptyState,
} from '@/components/ui/EmptyState';

import {
    Pagination,
} from '@/components/ui/Pagination';

import {
    useUsers,
} from '@/hooks/useUsers';

import type {
    UsuarioCriado,
    UsuarioListado,
    UsuarioStatusFiltro,
    UsuariosFiltrosValue,
} from '@/types/users.types';

import {
    getErrorMessage,
} from '@/utils/api-error';

const PAGE_SIZE = 20;

const EMPTY_FILTERS: UsuariosFiltrosValue = {
    busca: '',
    papel: '',
    status: '',
};

function converterStatusParaAtivo(
    status: UsuarioStatusFiltro,
): boolean | undefined {
    if (status === 'ATIVOS') {
        return true;
    }

    if (status === 'INATIVOS') {
        return false;
    }

    return undefined;
}

export function UsersPage(): JSX.Element {
    const [
        page,
        setPage,
    ] = useState(1);

    const [
        draftFilters,
        setDraftFilters,
    ] = useState<UsuariosFiltrosValue>(
        EMPTY_FILTERS,
    );

    const [
        appliedFilters,
        setAppliedFilters,
    ] = useState<UsuariosFiltrosValue>(
        EMPTY_FILTERS,
    );

    const [
        createDialogOpen,
        setCreateDialogOpen,
    ] = useState(false);

    const [
        successMessage,
        setSuccessMessage,
    ] = useState<string | null>(
        null,
    );

    const usersQuery = useUsers({
        pagina: page,
        limite: PAGE_SIZE,

        busca:
            appliedFilters.busca ||
            undefined,

        papel:
            appliedFilters.papel ||
            undefined,

        ativo:
            converterStatusParaAtivo(
                appliedFilters.status,
            ),
    });

    const {
        user: currentUser,
        logoutAll,
    } = useAuth();

    const [logoutAllOpen, setLogoutAllOpen] = useState(false);
    const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

    async function handleLogoutAll(): Promise<void> {
        setIsLoggingOutAll(true);
        try {
            await logoutAll();
        } finally {
            setIsLoggingOutAll(false);
            setLogoutAllOpen(false);
        }
    }

    const changeStatusMutation =
        useChangeUserStatus();

    const [
        statusTarget,
        setStatusTarget,
    ] = useState<UsuarioListado | null>(
        null,
    );

    const [
        statusSuccessMessage,
        setStatusSuccessMessage,
    ] = useState<string | null>(
        null,
    );

    const [
        statusErrorMessage,
        setStatusErrorMessage,
    ] = useState<string | null>(
        null,
    );

    function requestStatusChange(
        target: UsuarioListado,
    ): void {
        if (
            target.id === currentUser?.id
        ) {
            return;
        }

        setStatusSuccessMessage(null);
        setStatusErrorMessage(null);
        setStatusTarget(target);
    }

    async function confirmStatusChange(): Promise<void> {
        if (!statusTarget) {
            return;
        }

        try {
            const updatedUser =
                await changeStatusMutation
                    .mutateAsync({
                        usuarioId:
                            statusTarget.id,

                        ativo:
                            !statusTarget.ativo,
                    });

            setStatusSuccessMessage(
                `${updatedUser.nome} foi ${updatedUser.ativo
                    ? 'ativado'
                    : 'desativado'
                } com sucesso.`,
            );

            setStatusTarget(null);
        } catch (error: unknown) {
            setStatusErrorMessage(
                getErrorMessage(error),
            );

            setStatusTarget(null);
        }
    }

    function handleUserCreated(
        user: UsuarioCriado,
    ): void {
        setPage(1);

        setSuccessMessage(
            `${user.nome} foi cadastrado com sucesso.`,
        );

        setCreateDialogOpen(false);
    }

    function applyFilters(): void {
        setPage(1);

        setAppliedFilters({
            busca:
                draftFilters.busca.trim(),

            papel:
                draftFilters.papel,

            status:
                draftFilters.status,
        });
    }

    function clearFilters(): void {
        setPage(1);

        setDraftFilters(
            EMPTY_FILTERS,
        );

        setAppliedFilters(
            EMPTY_FILTERS,
        );
    }

    const response =
        usersQuery.data;

    const users =
        response?.data ?? [];

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold gm-text-primary">
                        Administração
                    </p>

                    <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                        Gestão de usuários
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Consulte os usuários
                        cadastrados e filtre por
                        nome, e-mail, papel ou
                        status de acesso.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {response ? (
                        <div className="rounded-xl border gm-border bg-white px-4 py-3 text-right shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Usuários encontrados
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-950">
                                {response.meta.total}
                            </p>
                        </div>
                    ) : null}

                    <Button
                        onClick={() => {
                            setSuccessMessage(null);
                            setCreateDialogOpen(true);
                        }}
                    >
                        <UserPlus
                            aria-hidden="true"
                            className="h-4 w-4"
                        />

                        Cadastrar usuário
                    </Button>

                    <Button
                        variant="danger"
                        onClick={() => setLogoutAllOpen(true)}
                    >
                        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                        Encerrar minhas sessões
                    </Button>
                </div>
            </section>

            {successMessage ? (
                <Alert
                    variant="success"
                    title="Usuário cadastrado"
                >
                    {successMessage}
                </Alert>
            ) : null}

            {statusSuccessMessage ? (
                <Alert
                    variant="success"
                    title="Status atualizado"
                >
                    {statusSuccessMessage}
                </Alert>
            ) : null}

            {statusErrorMessage ? (
                <Alert
                    variant="error"
                    title="Não foi possível alterar o status"
                >
                    {statusErrorMessage}
                </Alert>
            ) : null}

            <section className="gm-panel p-5 sm:p-6">
                <UserFilters
                    value={draftFilters}
                    isLoading={
                        usersQuery.isFetching
                    }
                    onChange={
                        setDraftFilters
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
                <div className="flex items-center justify-between gap-4 border-b gm-border px-5 py-4">
                    <div>
                        <h3 className="font-bold text-slate-950">
                            Usuários cadastrados
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Consulte perfis, funções e situações de acesso.
                        </p>
                    </div>

                    {usersQuery.isFetching &&
                        !usersQuery.isLoading ? (
                        <span className="text-xs font-semibold gm-text-primary">
                            Atualizando…
                        </span>
                    ) : null}
                </div>

                {usersQuery.isLoading ? (
                    <UsersTableSkeleton />
                ) : null}

                {usersQuery.isError ? (
                    <div className="space-y-4 p-5 sm:p-6">
                        <Alert
                            variant="error"
                            title="Não foi possível carregar os usuários"
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

                {!usersQuery.isLoading &&
                    !usersQuery.isError &&
                    users.length === 0 ? (
                    <EmptyState
                        icon={
                            <UsersRound
                                aria-hidden="true"
                                className="h-7 w-7"
                            />
                        }
                        title="Nenhum usuário encontrado"
                        description="Ajuste os filtros ou confirme se existem usuários cadastrados com os critérios selecionados."
                    />
                ) : null}

                {!usersQuery.isLoading &&
                    !usersQuery.isError &&
                    users.length > 0 ? (
                    <>
                        <UsersTable
                            users={users}
                            currentUserId={currentUser?.id ?? ''}
                            statusChangeDisabled={
                                changeStatusMutation.isPending
                            }
                            onRequestStatusChange={
                                requestStatusChange
                            }
                        />

                        <Pagination
                            page={page}
                            totalPages={
                                response?.meta
                                    .totalPaginas ?? 0
                            }
                            disabled={
                                usersQuery.isFetching
                            }
                            onPageChange={
                                setPage
                            }
                        />
                    </>
                ) : null}
            </section>
            <CreateUserDialog
                open={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false);
                }}
                onCreated={
                    handleUserCreated
                }
            />

            <ConfirmDialog
                open={logoutAllOpen}
                title="Encerrar todas as suas sessões?"
                description="Sua conta será desconectada deste dispositivo e dos demais. As sessões dos outros usuários não serão afetadas."
                confirmLabel="Encerrar minhas sessões"
                confirmVariant="danger"
                isLoading={isLoggingOutAll}
                onClose={() => {
                    if (!isLoggingOutAll) setLogoutAllOpen(false);
                }}
                onConfirm={() => void handleLogoutAll()}
            />

            <ConfirmDialog
                open={
                    statusTarget !== null
                }
                title={
                    statusTarget?.ativo
                        ? 'Desativar usuário?'
                        : 'Ativar usuário?'
                }
                description={
                    statusTarget?.ativo
                        ? `O usuário ${statusTarget.nome} perderá o acesso ao sistema e suas sessões atuais serão encerradas.`
                        : `O usuário ${statusTarget?.nome ?? ''} poderá voltar a acessar o sistema.`
                }
                confirmLabel={
                    statusTarget?.ativo
                        ? 'Desativar usuário'
                        : 'Ativar usuário'
                }
                confirmVariant={
                    statusTarget?.ativo
                        ? 'danger'
                        : 'primary'
                }
                isLoading={
                    changeStatusMutation.isPending
                }
                onClose={() => {
                    if (
                        !changeStatusMutation.isPending
                    ) {
                        setStatusTarget(null);
                    }
                }}
                onConfirm={() => {
                    void confirmStatusChange();
                }}
            />
        </div>
    );
}
