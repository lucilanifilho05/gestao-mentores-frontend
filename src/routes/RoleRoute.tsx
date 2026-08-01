import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import type { Papel } from '@/types/auth.types';

interface RoleRouteProps extends PropsWithChildren {
  allowed: Papel[];
}

export function RoleRoute({ allowed, children }: RoleRouteProps): JSX.Element {
  const { user } = useAuth();

  if (!user || !allowed.includes(user.papel)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
