import {
  Power,
  Pencil,
} from 'lucide-react';

import {
  UserRoleBadge,
} from '@/components/users/UserRoleBadge';

import {
  UserStatusBadge,
} from '@/components/users/UserStatusBadge';

import {
  Button,
} from '@/components/ui/Button';

import type {
  UsuarioListado,
} from '@/types/users.types';

interface UsersTableProps {
  users: UsuarioListado[];
  currentUserId: string;
  statusChangeDisabled?: boolean;

  onRequestStatusChange: (
    user: UsuarioListado,
  ) => void;
  onEditMentor: (user: UsuarioListado) => void;
}

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  ).format(new Date(value));
}

export function UsersTable({
  users,
  currentUserId,
  statusChangeDisabled = false,
  onRequestStatusChange,
  onEditMentor,
}: UsersTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b gm-border bg-slate-50/80 text-left">
            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Usuário
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Papel
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Status
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Último acesso
            </th>

            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              Cadastro
            </th>

            <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const isCurrentUser =
              user.id === currentUserId;

            return (
              <tr
                key={user.id}
                className="border-b gm-border last:border-b-0 hover:bg-slate-50/60"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    {user.nome}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.email}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <UserRoleBadge
                    papel={user.papel}
                  />
                </td>

                <td className="px-5 py-4">
                  <UserStatusBadge
                    ativo={user.ativo}
                  />
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {user.ultimoLoginEm
                    ? formatDateTime(
                        user.ultimoLoginEm,
                      )
                    : 'Nunca acessou'}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {formatDateTime(
                    user.criadoEm,
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                  {user.papel === 'MENTOR' ? <Button variant="secondary" onClick={() => onEditMentor(user)}><Pencil aria-hidden="true" className="h-4 w-4" />Editar</Button> : null}
                  {isCurrentUser ? (
                    <span
                      className="inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500"
                      title="Você não pode alterar o status da própria conta."
                    >
                      Sua conta
                    </span>
                  ) : user.papel === 'MENTOR' ? (
                    <Button
                      variant={
                        user.ativo
                          ? 'danger'
                          : 'primary'
                      }
                      disabled={
                        statusChangeDisabled
                      }
                      onClick={() => {
                        onRequestStatusChange(
                          user,
                        );
                      }}
                    >
                      <Power
                        aria-hidden="true"
                        className="h-4 w-4"
                      />

                      {user.ativo
                        ? 'Desativar'
                        : 'Ativar'}
                    </Button>
                  ) : <span className="inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Somente leitura</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function UsersTableSkeleton(): JSX.Element {
  return (
    <div
      className="overflow-hidden"
      aria-label="Carregando usuários"
    >
      <div className="h-12 animate-pulse border-b gm-border bg-slate-100" />

      {Array.from(
        {
          length: 5,
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

            <div className="h-6 w-24 rounded-full bg-slate-100" />
            <div className="h-6 w-20 rounded-full bg-slate-100" />
            <div className="h-9 w-24 rounded-lg bg-slate-100" />
          </div>
        ),
      )}
    </div>
  );
}
