import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute(): JSX.Element {
  const location = useLocation();
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
