import {
  AlertTriangle,
  X,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/Button';

type ConfirmDialogVariant =
  | 'primary'
  | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  const iconClassName =
    confirmVariant === 'danger'
      ? 'bg-red-50 text-red-700'
      : 'gm-primary-light gm-text-primary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      role="presentation"
    >
      <div
        aria-modal="true"
        className="gm-panel w-full max-w-md p-6"
        role="dialog"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
            >
              <AlertTriangle
                aria-hidden="true"
                className="h-5 w-5"
              />
            </div>

            <div>
              <h2
                id="confirm-dialog-title"
                className="text-lg font-semibold text-slate-950"
              >
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar"
            onClick={onClose}
            disabled={isLoading}
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}