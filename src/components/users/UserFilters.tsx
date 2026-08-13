import {
  Search,
  X,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/Button';

import type {
  UsuariosFiltrosValue,
} from '@/types/users.types';

interface UserFiltersProps {
  value: UsuariosFiltrosValue;
  isLoading?: boolean;

  onChange: (
    value: UsuariosFiltrosValue,
  ) => void;

  onSubmit: () => void;
  onClear: () => void;
}

export function UserFilters({
  value,
  isLoading = false,
  onChange,
  onSubmit,
  onClear,
}: UserFiltersProps): JSX.Element {
  const hasFilters = Boolean(
    value.busca ||
    value.papel ||
    value.status,
  );

  return (
    <form
      className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_210px_210px_auto] xl:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Buscar por nome ou e-mail
        </span>

        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />

          <input
            className="gm-input gm-input-leading"
            type="search"
            maxLength={100}
            placeholder="Digite um nome ou e-mail"
            value={value.busca}
            onChange={(event) => {
              onChange({
                ...value,
                busca:
                  event.target.value,
              });
            }}
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Papel
        </span>

        <select
          className="gm-input"
          value={value.papel}
          onChange={(event) => {
            onChange({
              ...value,

              papel:
                event.target
                  .value as UsuariosFiltrosValue['papel'],
            });
          }}
        >
          <option value="">
            Todos os papéis
          </option>

          <option value="COORDENADORA">
            Coordenadora
          </option>

          <option value="MENTOR">
            Mentor
          </option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Status
        </span>

        <select
          className="gm-input"
          value={value.status}
          onChange={(event) => {
            onChange({
              ...value,

              status:
                event.target
                  .value as UsuariosFiltrosValue['status'],
            });
          }}
        >
          <option value="">
            Todos os status
          </option>

          <option value="ATIVOS">
            Ativos
          </option>

          <option value="INATIVOS">
            Inativos
          </option>
        </select>
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Filtrar
        </Button>

        {hasFilters ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onClear}
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
  );
}
