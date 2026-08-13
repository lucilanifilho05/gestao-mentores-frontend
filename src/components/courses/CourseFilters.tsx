import {
  Search,
  X,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/Button';

import type {
  CursoStatusFiltro,
} from '@/types/courses.types';

interface CourseFiltersProps {
  search: string;
  status: CursoStatusFiltro;
  isLoading?: boolean;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: CursoStatusFiltro,
  ) => void;

  onSubmit: () => void;
  onClear: () => void;
}

export function CourseFilters({
  search,
  status,
  isLoading = false,
  onSearchChange,
  onStatusChange,
  onSubmit,
  onClear,
}: CourseFiltersProps): JSX.Element {
  const hasFilters =
    Boolean(search || status);

  return (
    <form
      className="grid gap-4 md:grid-cols-[minmax(260px,1fr)_220px_auto] md:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Buscar curso
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
            placeholder="Digite o nome do curso"
            value={search}
            onChange={(event) => {
              onSearchChange(
                event.target.value,
              );
            }}
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Status
        </span>

        <select
          className="gm-input"
          value={status}
          onChange={(event) => {
            onStatusChange(
              event.target
                .value as CursoStatusFiltro,
            );
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
