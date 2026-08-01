import type { Papel } from '@/types/auth.types';

interface UserRoleBadgeProps {
  papel: Papel;
}

const roleConfig: Record<
  Papel,
  {
    label: string;
    className: string;
  }
> = {
  COORDENADORA: {
    label: 'Coordenadora',
    className: 'gm-role-coordinator',
  },

  MENTOR: {
    label: 'Mentor',
    className: 'gm-role-mentor',
  },
};

export function UserRoleBadge({
  papel,
}: UserRoleBadgeProps): JSX.Element {
  const config = roleConfig[papel];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}