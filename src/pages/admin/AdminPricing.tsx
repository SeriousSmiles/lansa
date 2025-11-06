import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPricing() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-pricing-stats'],
    queryFn: async () => {
      const { data: allEvents } = await supabase
        .from('pricing_wall_events')
        .select('*')
        .order('created_at', { ascending: false });

      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const events7d = allEvents?.filter(e => new Date(e.created_at) >= last7Days) || [];
      const events30d = allEvents?.filter(e => new Date(e.created_at) >= last30Days) || [];

      const fired30d = events30d.filter(e => e.outcome === 'fired').length;
      const converted30d = events30d.filter(e => e.outcome === 'paid').length;
      const ignored30d = events30d.filter(e => e.outcome === 'ignored').length;

      const conversionRate = fired30d > 0 ? (converted30d / fired30d * 100).toFixed(1) : '0';

      return {
        fired7d: events7d.filter(e => e.outcome === 'fired').length,
        fired30d,
        converted30d,
        ignored30d,
        conversionRate,
        recentEvents: allEvents?.slice(0, 50) || []
      };
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
    <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hit Wall (7d)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.fired7d || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hit Wall (30d)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.fired30d || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Converted (30d)</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.converted30d || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.conversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ignored (30d)</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.ignored30d || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Certification Funnel (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">Reached Wall</div>
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/20 h-8 rounded flex items-center px-3">
                  <span className="text-sm font-bold">{stats?.fired30d || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">Converted</div>
                <div 
                  className="bg-green-100 dark:bg-green-900/20 h-8 rounded flex items-center px-3"
                  style={{ width: `${Math.max((stats?.converted30d || 0) / (stats?.fired30d || 1) * 100, 5)}%` }}
                >
                  <span className="text-sm font-bold">{stats?.converted30d || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">Ignored</div>
                <div 
                  className="bg-orange-100 dark:bg-orange-900/20 h-8 rounded flex items-center px-3"
                  style={{ width: `${Math.max((stats?.ignored30d || 0) / (stats?.fired30d || 1) * 100, 5)}%` }}
                >
                  <span className="text-sm font-bold">{stats?.ignored30d || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Pricing Wall Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm">
                    <th className="p-2 font-medium">Timestamp</th>
                    <th className="p-2 font-medium">Wall Type</th>
                    <th className="p-2 font-medium">Outcome</th>
                    <th className="p-2 font-medium">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentEvents.map((event) => (
                    <tr key={event.id} className="border-b text-sm hover:bg-muted/50">
                      <td className="p-2">{new Date(event.created_at).toLocaleString()}</td>
                      <td className="p-2 capitalize">{event.wall}</td>
                      <td className="p-2">
                        <span className={`
                          ${event.outcome === 'paid' ? 'text-green-600' : ''}
                          ${event.outcome === 'ignored' ? 'text-orange-600' : ''}
                          ${event.outcome === 'dismissed' ? 'text-red-600' : ''}
                          font-medium
                        `}>
                          {event.outcome}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs">{event.user_id.substring(0, 8)}...</td>
                    </tr>
                  ))}
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
