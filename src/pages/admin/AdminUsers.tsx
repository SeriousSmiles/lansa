import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColorChip } from '@/components/admin/ColorChip';
import { getEffectiveColor, INTENT_CONFIG } from '@/utils/adminColors';
import { Filter, RefreshCw } from 'lucide-react';
import { UserDrawer } from '@/components/admin/UserDrawer';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
      // Get all user profiles for stats
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('certified, color_admin, color_auto, last_active_at');

      if (!allUsers) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsers = allUsers.filter(u => 
        u.last_active_at && new Date(u.last_active_at) > thirtyDaysAgo
      ).length;

      const certifiedUsers = allUsers.filter(u => u.certified).length;

      const colorCounts = {
        purple: 0,
        green: 0,
        orange: 0,
        red: 0,
        unassigned: 0
      };

      allUsers.forEach(user => {
        const color = getEffectiveColor(user.color_admin, user.color_auto);
        if (color) {
          colorCounts[color as keyof typeof colorCounts]++;
        } else {
          colorCounts.unassigned++;
        }
      });

      return {
        total: allUsers.length,
        active: activeUsers,
        certified: certifiedUsers,
        colors: colorCounts
      };
    }
  });

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchQuery, colorFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_profiles')
        .select('*');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (colorFilter !== 'all') {
        query = query.or(`color_admin.eq.${colorFilter},color_auto.eq.${colorFilter}`);
      }

      const { data } = await query.order('created_at', { ascending: false });
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
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="p-2 md:p-3 rounded-lg border bg-card">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="text-xl md:text-2xl font-bold">{stats?.total || 0}</div>
        </div>
        <div className="p-2 md:p-3 rounded-lg border bg-card">
          <div className="text-xs text-muted-foreground mb-1">Active</div>
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats?.active || 0}</div>
        </div>
        <div className="p-2 md:p-3 rounded-lg border bg-card">
          <div className="text-xs text-muted-foreground mb-1">Certified</div>
          <div className="text-xl md:text-2xl font-bold text-blue-600">{stats?.certified || 0}</div>
        </div>
        <div className="p-2 md:p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
          <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">Purple</div>
          <div className="text-xl md:text-2xl font-bold text-purple-600">{stats?.colors.purple || 0}</div>
        </div>
        <div className="p-2 md:p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
          <div className="text-xs text-green-700 dark:text-green-300 mb-1">Green</div>
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats?.colors.green || 0}</div>
        </div>
        <div className="p-2 md:p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
          <div className="text-xs text-orange-700 dark:text-orange-300 mb-1">Orange</div>
          <div className="text-xl md:text-2xl font-bold text-orange-600">{stats?.colors.orange || 0}</div>
        </div>
        <div className="p-2 md:p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
          <div className="text-xs text-red-700 dark:text-red-300 mb-1">Red</div>
          <div className="text-xl md:text-2xl font-bold text-red-600">{stats?.colors.red || 0}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-4 md:mb-6">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64"
        />
        <Select value={colorFilter} onValueChange={setColorFilter}>
          <SelectTrigger className="w-full md:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colors</SelectItem>
            <SelectItem value="purple">Purple</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: Card List, Desktop: Table */}
      <div className="md:hidden space-y-3">
        {users?.map((user) => {
          const effectiveColor = getEffectiveColor(user.color_admin, user.color_auto);
          return (
            <Card key={user.user_id} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profile_image || undefined} />
                  <AvatarFallback>
                    {user.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.name || 'Unnamed User'}</div>
                  <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                </div>
                {effectiveColor && <ColorChip color={effectiveColor} />}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <span>{user.title || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Certified: </span>
                  {user.certified ? (
                    <span className="text-green-600 font-medium">✓</span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Intent: </span>
                  <span className={INTENT_CONFIG[user.intent || 'none'].color}>
                    {INTENT_CONFIG[user.intent || 'none'].label}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Active: </span>
                  <span>
                    {user.last_active_at
                      ? new Date(user.last_active_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'}
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedUserId(user.user_id)}
              >
                View Details
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">User Type</th>
                <th className="p-4 font-medium">Color</th>
                <th className="p-4 font-medium">Certified</th>
                <th className="p-4 font-medium">Intent</th>
                <th className="p-4 font-medium">Last Active</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => {
                const effectiveColor = getEffectiveColor(user.color_admin, user.color_auto);
                return (
                  <tr key={user.user_id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.profile_image || undefined} />
                          <AvatarFallback>
                            {user.name?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || 'Unnamed User'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm capitalize">
                        {user.title || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      {effectiveColor ? (
                        <ColorChip color={effectiveColor} />
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.certified ? (
                        <span className="text-sm text-green-600 font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${INTENT_CONFIG[user.intent || 'none'].color}`}>
                        {INTENT_CONFIG[user.intent || 'none'].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {user.last_active_at
                          ? new Date(user.last_active_at).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUserId(user.user_id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                 );
               })}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUserId && (
        <UserDrawer
          userId={selectedUserId}
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
}
