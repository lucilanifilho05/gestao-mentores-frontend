import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { LoaderCircle } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'gm-button-primary',
  secondary: 'gm-button-secondary',
  danger: 'gm-button-danger',
  ghost: 'gm-button-ghost',
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      className={`gm-button ${variantClasses[variant]} ${className}`.trim()}
    >
      {isLoading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
