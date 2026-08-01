import { Navigate, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';

export function PublicOnlyRoute(): JSX.Element {
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
