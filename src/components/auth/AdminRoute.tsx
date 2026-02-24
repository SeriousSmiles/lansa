/**
 * @deprecated Admin route guard is now handled by <Guard admin> in App.tsx.
 * This file re-exports Guard for backward compatibility only.
 */
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthProvider';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { loading, isAdmin, isAuthenticated, isRefreshing } = useUnifiedAuth();

  if (loading && !isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  return children;
}
