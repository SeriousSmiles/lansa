import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { Building2, RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

export default function AdminOrganizations() {
  const { data: organizations, isLoading, refetch } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_memberships(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return data || [];
    }
  });

  const { containerRef, isRefreshing: isPulling } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {isPulling && (
        <div className="text-center py-2 md:hidden">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
        </div>
      )}
      
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {organizations?.map((org) => (
          <Card key={org.id} className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate text-sm md:text-base">{org.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">
                  {org.industry || 'No industry set'}
                </p>
                <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members:</span>
                    <span className="font-medium">
                      {Array.isArray(org.organization_memberships) ? org.organization_memberships.length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{org.size_range || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {organizations?.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No organizations found</p>
        </Card>
      )}
    </div>
  );
}
