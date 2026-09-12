import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <LoadingSkeleton className="w-64 max-w-full" count={3} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user && !user.setupComplete && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (user?.setupComplete && location.pathname === '/setup') {
    return <Navigate to="/today" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
