interface PaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

function getVisiblePages(
  page: number,
  totalPages: number,
): number[] {
  const start = Math.max(
    1,
    Math.min(page - 2, totalPages - 4),
  );

  const end = Math.min(
    totalPages,
    start + 4,
  );

  return Array.from(
    {
      length: end - start + 1,
    },
    (_, index) => start + index,
  );
}

export function Pagination({
  page,
  totalPages,
  disabled = false,
  onPageChange,
}: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(
    page,
    totalPages,
  );

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t gm-border px-5 py-4"
      aria-label="Paginação"
    >
      <p className="text-sm text-slate-500">
        Página{' '}
        <strong className="text-slate-800">
          {page}
        </strong>{' '}
        de{' '}
        <strong className="text-slate-800">
          {totalPages}
        </strong>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="rounded-lg border gm-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
        >
          Anterior
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {visiblePages.map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold transition ${
                  pageNumber === page
                    ? 'gm-pagination-page-active'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-current={
                  pageNumber === page
                    ? 'page'
                    : undefined
                }
                disabled={disabled}
                onClick={() =>
                  onPageChange(pageNumber)
                }
              >
                {pageNumber}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border gm-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={
            disabled || page >= totalPages
          }
          onClick={() =>
            onPageChange(page + 1)
          }
        >
          Próxima
        </button>
      </div>
    </nav>
  );
}