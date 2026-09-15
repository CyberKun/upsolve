import { Outlet } from 'react-router';
import { useAuth } from '@/features/auth/useAuth';

export function Layout() {
  const { isDemoMode } = useAuth();
  return <>
    {isDemoMode && <div className="border-b border-border bg-warning-light px-4 py-2 text-center text-sm font-medium text-warning">Viewing Demo Mode. Modifications are disabled.</div>}
    <Outlet />
  </>;
}
