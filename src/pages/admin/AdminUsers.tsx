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
import { Filter } from 'lucide-react';
import { UserDrawer } from '@/components/admin/UserDrawer';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: totalCount } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="text-sm text-muted-foreground">
          Total Users: <span className="font-medium">{totalCount}</span>
        </div>
        <div className="flex items-center gap-2">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Select value={colorFilter} onValueChange={setColorFilter}>
          <SelectTrigger className="w-40">
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
      </div>

      <Card>
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
    </>
  );
}
