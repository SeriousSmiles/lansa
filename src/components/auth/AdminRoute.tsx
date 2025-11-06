import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserState } from '@/contexts/UserStateProvider';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

export function AdminRoute({ children }: { children: JSX.Element }) {
  const { loading: userLoading, userId } = useUserState();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (userLoading) return;
      if (!userId) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!cancelled) setIsAdmin(!!data && !error);
    }
    check();
    return () => { cancelled = true; };
  }, [userLoading, userId]);

  if (userLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
