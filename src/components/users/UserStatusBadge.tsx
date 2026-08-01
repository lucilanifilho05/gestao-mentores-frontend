interface UserStatusBadgeProps {
  ativo: boolean;
}

export function UserStatusBadge({
  ativo,
}: UserStatusBadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        ativo
          ? 'gm-user-status-active'
          : 'gm-user-status-inactive'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          ativo
            ? 'gm-user-status-dot-active'
            : 'gm-user-status-dot-inactive'
        }`}
      />

      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  );
}