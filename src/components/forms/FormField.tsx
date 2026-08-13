import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    {
      id,
      label,
      error,
      hint,
      leadingIcon,
      className = '',
      ...props
    },
    ref,
  ) {
    const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <div className="relative">
          {leadingIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              {leadingIcon}
            </span>
          ) : null}
          <input
            {...props}
            ref={ref}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            className={`gm-input ${leadingIcon ? 'gm-input-leading' : ''} ${error ? 'gm-input-error' : ''} ${className}`.trim()}
          />
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
