import type { PropsWithChildren } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps extends PropsWithChildren {
  variant?: AlertVariant;
  title?: string;
}

const iconByVariant = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({
  children,
  variant = 'info',
  title,
}: AlertProps): JSX.Element {
  const Icon = iconByVariant[variant];

  return (
    <div className={`gm-alert gm-alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="whitespace-normal break-words text-sm leading-6">{children}</div>
      </div>
    </div>
  );
}
