import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { COLOR_CONFIG, getEffectiveColor } from '@/utils/adminColors';
import { Users, TrendingUp, Award, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminHome() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('color_admin, color_auto, certified, user_id');

      const colorCounts = {
        purple: 0,
        green: 0,
        orange: 0,
        red: 0,
        unassigned: 0
      };

      profiles?.forEach(profile => {
        const color = getEffectiveColor(profile.color_admin, profile.color_auto);
        if (color) {
          colorCounts[color]++;
        } else {
          colorCounts.unassigned++;
        }
      });

      const { count: certifiedCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('certified', true);

      const { data: recentWalls } = await supabase
        .from('pricing_wall_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        colorCounts,
        totalUsers: profiles?.length || 0,
        certifiedCount: certifiedCount || 0,
        recentWalls: recentWalls || []
      };
    }
  });

  const handleRefreshColors = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('update-user-colors');
      
      if (error) throw error;

      toast({
        title: 'Colors updated',
        description: 'User colors have been recalculated successfully.',
      });

      // Refetch stats to show updated counts
      await refetch();
    } catch (error) {
      console.error('Error refreshing colors:', error);
      toast({
        title: 'Error updating colors',
        description: 'There was an error recalculating user colors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleRefreshColors} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Colors
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

          {Object.entries(COLOR_CONFIG).map(([color, config]) => (
            <Card key={color}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <span className="mr-2">{config.pattern}</span>
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.colorCounts[color as keyof typeof stats.colorCounts] || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certification Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Certified Users</span>
                  <span className="font-bold">{stats?.certifiedCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Certified</span>
                  <span className="font-bold">
                    {(stats?.totalUsers || 0) - (stats?.certifiedCount || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats?.recentWalls?.length || 0} recent pricing wall events
              </p>
              <div className="mt-4 space-y-2">
                {stats?.recentWalls?.slice(0, 3).map((event) => (
                  <div key={event.id} className="text-xs text-muted-foreground">
                    {event.outcome} - {new Date(event.created_at).toLocaleString()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Narrative Hint */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <AlertCircle className="h-5 w-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200">
            <p>Most students reach the certification wall within 3 sessions. Monitor engagement patterns to identify users ready for upgrade.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
