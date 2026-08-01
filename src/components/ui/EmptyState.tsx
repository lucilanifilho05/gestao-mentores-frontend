import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="gm-brand-icon h-14 w-14">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}