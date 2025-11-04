import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkAdminRole } from '@/utils/roleHelpers';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) return;

      if (!user) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const adminStatus = await checkAdminRole(user.id);
        
        if (!adminStatus) {
          navigate('/', { replace: true });
          return;
        }

        setIsAdmin(true);

        // Log admin access
        await supabase.from('admin_access_log').insert({
          admin_id: user.id,
          path: window.location.pathname
        });
      } catch (error) {
        console.error('Admin auth check failed:', error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [user, authLoading, navigate]);

  return { isAdmin, loading };
}
