import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { Shield, Activity } from 'lucide-react';

export default function AdminSettings() {
  const { data: auditLog, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_actions_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      return data || [];
    }
  });

  const { data: admins, isLoading: adminsLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');

      if (!roles) return [];

      // Fetch profiles separately
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      // Combine data
      return roles.map(role => ({
        ...role,
        profile: profiles?.find(p => p.user_id === role.user_id)
      }));
    }
  });

  if (logsLoading || adminsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Admin Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Roles
            </CardTitle>
            <CardDescription>
              Users with admin access to this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {admins?.map((admin) => (
                <div key={admin.user_id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">
                      {admin.profile?.name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {admin.profile?.email || 'No email'}
                    </div>
                  </div>
                  <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {admin.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Admin Actions
            </CardTitle>
            <CardDescription>
              Audit trail of admin activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLog?.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 border rounded text-sm">
                  <div>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
