import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColorChip } from '@/components/admin/ColorChip';
import { getEffectiveColor, INTENT_CONFIG, UserColor, IntentStage } from '@/utils/adminColors';
import { RefreshCw, Download, Info, AlertCircle } from 'lucide-react';
import { UserDrawer } from '@/components/admin/UserDrawer';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { EnhancedFiltersPanel, FilterOptions } from '@/components/admin/EnhancedFiltersPanel';
import { BulkActionsToolbar } from '@/components/admin/BulkActionsToolbar';
import { exportUsersToCSV, UserExportData } from '@/utils/csvExport';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3 w-3 text-muted-foreground/50 cursor-help shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    colorFilter: 'all',
    userType: 'all',
    certifiedFilter: 'all',
    onboardingFilter: 'all',
    intentFilter: 'all',
    visibilityFilter: 'all',
    dateRange: 'all',
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
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
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      let filtered = data || [];
      
      if (filters.search.trim()) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(u => 
          u.name?.toLowerCase().includes(search) || 
          u.email?.toLowerCase().includes(search)
        );
      }
      
      if (filters.colorFilter !== 'all') {
        filtered = filtered.filter(u => 
          u.color_admin === filters.colorFilter || u.color_auto === filters.colorFilter
        );
      }
      
      if (filters.certifiedFilter === 'certified') {
        filtered = filtered.filter(u => u.certified);
      } else if (filters.certifiedFilter === 'not_certified') {
        filtered = filtered.filter(u => !u.certified);
      }
      
      if (filters.onboardingFilter === 'completed') {
        filtered = filtered.filter(u => u.onboarding_completed);
      } else if (filters.onboardingFilter === 'incomplete') {
        filtered = filtered.filter(u => !u.onboarding_completed);
      }
      
      if (filters.intentFilter !== 'all') {
        if (filters.intentFilter === 'none') {
          filtered = filtered.filter(u => !u.intent);
        } else {
          filtered = filtered.filter(u => u.intent === filters.intentFilter);
        }
      }
      
      if (filters.visibilityFilter === 'visible') {
        filtered = filtered.filter(u => u.visible_to_employers);
      } else if (filters.visibilityFilter === 'hidden') {
        filtered = filtered.filter(u => !u.visible_to_employers);
      }
      
      if (filters.dateRange !== 'all') {
        const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        filtered = filtered.filter(u => u.last_active_at && new Date(u.last_active_at) > dateThreshold);
      }
      
      return filtered;
    }
  });

  const { containerRef, isRefreshing: isPulling } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ userIds, updates }: { 
      userIds: string[]; 
      updates: { color_admin?: UserColor | null; intent?: IntentStage } 
    }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .in('user_id', userIds);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        p_action: 'bulk_update_users',
        p_metadata: { userIds, updates, count: userIds.length }
      });
    },
    onSuccess: () => {
      toast({ title: 'Users updated successfully' });
      setSelectedUserIds(new Set());
      refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating users', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const deleteUsersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .in('user_id', userIds);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        p_action: 'bulk_delete_users',
        p_metadata: { userIds, count: userIds.length }
      });
    },
    onSuccess: () => {
      toast({ title: 'Users deleted successfully' });
      setSelectedUserIds(new Set());
      setShowDeleteDialog(false);
      refetch();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting users', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && users) {
      setSelectedUserIds(new Set(users.map(u => u.user_id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUserIds);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const handleExportSelected = () => {
    if (!users) return;
    const selectedUsers = users.filter(u => selectedUserIds.has(u.user_id));
    const exportData: UserExportData[] = selectedUsers.map(user => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      user_type: null,
      title: user.title,
      location: user.location,
      color_admin: user.color_admin,
      color_auto: user.color_auto,
      intent: user.intent,
      certified: user.certified,
      created_at: user.created_at,
      last_active_at: user.last_active_at,
      onboarding_completed: user.onboarding_completed,
      visible_to_employers: user.visible_to_employers,
      skills: user.skills,
    }));
    exportUsersToCSV(exportData);
    toast({ title: `Exported ${selectedUsers.length} users to CSV` });
  };

  const handleExportAll = () => {
    if (!users) return;
    const exportData: UserExportData[] = users.map(user => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      user_type: null,
      title: user.title,
      location: user.location,
      color_admin: user.color_admin,
      color_auto: user.color_auto,
      intent: user.intent,
      certified: user.certified,
      created_at: user.created_at,
      last_active_at: user.last_active_at,
      onboarding_completed: user.onboarding_completed,
      visible_to_employers: user.visible_to_employers,
      skills: user.skills,
    }));
    exportUsersToCSV(exportData);
    toast({ title: `Exported ${users.length} users to CSV` });
  };

  const handleAssignColor = (color: UserColor | null) => {
    bulkUpdateMutation.mutate({
      userIds: Array.from(selectedUserIds),
      updates: { color_admin: color }
    });
  };

  const handleAssignIntent = (intent: IntentStage) => {
    bulkUpdateMutation.mutate({
      userIds: Array.from(selectedUserIds),
      updates: { intent }
    });
  };

  const handleDeleteSelected = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteUsersMutation.mutate(Array.from(selectedUserIds));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      colorFilter: 'all',
      userType: 'all',
      certifiedFilter: 'all',
      onboardingFilter: 'all',
      intentFilter: 'all',
      visibilityFilter: 'all',
      dateRange: 'all',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div ref={containerRef}>
        {isPulling && (
          <div className="text-center py-2 md:hidden">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
          </div>
        )}

        {/* Incomplete signup notice */}
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> Supabase auth.users has <strong>145</strong> accounts, but only <strong>{stats?.total || 139}</strong> have completed profiles. The {145 - (stats?.total || 139)} missing users signed up but abandoned before finishing onboarding — they have no profile row and are invisible to tracking.
          </span>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 mb-4 md:mb-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 md:p-3 rounded-lg border bg-card cursor-help">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  Total <InfoTooltip content="Total users with a completed user_profiles row. Does not include 6 users who signed up but abandoned onboarding." />
                </div>
                <div className="text-xl md:text-2xl font-bold">{stats?.total || 0}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-xs">Users with a completed profile. auth.users has 145 total (6 incomplete signups excluded).</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 md:p-3 rounded-lg border bg-card cursor-help">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  Active <InfoTooltip content="Users who had a tracked action (user_actions or chat message) in the last 30 days, based on last_active_at." />
                </div>
                <div className="text-xl md:text-2xl font-bold text-green-600">{stats?.active || 0}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-xs">Had at least one tracked action in the last 30 days (last_active_at within 30d).</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 md:p-3 rounded-lg border bg-card cursor-help">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  Certified <InfoTooltip content="Users with lansa_certified = true in user_certifications. Indicates they passed the Lansa certification exam." />
                </div>
                <div className="text-xl md:text-2xl font-bold text-blue-600">{stats?.certified || 0}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-xs">Passed the Lansa certification exam.</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 md:p-3 rounded-lg border bg-purple-50 dark:bg-purple-950/20 cursor-help">
                <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">🟣 Advocate</div>
                <div className="text-xl md:text-2xl font-bold text-purple-600">{stats?.colors.purple || 0}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-xs">Advocate — Consistently uses Lansa for its core purpose, creates outputs, and returns regularly. Highest engagement score.</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 md:p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 cursor-help">
                <div className="text-xs text-green-700 dark:text-green-300 mb-1">🟢 Engaged</div>
                <div className="text-xl md:text-2xl font-bold text-green-600">{stats?.colors.green || 0}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-xs">Engaged — Actively using 2–3+ key features in the last 30 days. Strong positive signal.</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 md:p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20 cursor-help">
                <div className="text-xs text-orange-700 dark:text-orange-300 mb-1">🟠 Underused</div>
                <div className="text-xl md:text-2xl font-bold text-orange-600">{stats?.colors.orange || 0}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-xs">Underused — Completed onboarding and has used some features, but activity is infrequent or limited to 1 tool.</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 md:p-3 rounded-lg border bg-red-50 dark:bg-red-950/20 cursor-help">
                <div className="text-xs text-red-700 dark:text-red-300 mb-1">🔴 Drifting</div>
                <div className="text-xl md:text-2xl font-bold text-red-600">{stats?.colors.red || 0}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-xs">Drifting — No meaningful action in 21+ days. Score halved by recency penalty. Automated nudge email sent when entering this segment.</TooltipContent>
          </Tooltip>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-4 md:mb-6">
          <EnhancedFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {users?.length || 0} users found
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All CSV
          </Button>
        </div>

        {/* Mobile: Card List */}
        <div className="md:hidden space-y-3">
          {users?.map((user) => {
            const effectiveColor = getEffectiveColor(user.color_admin, user.color_auto);
            return (
              <Card key={user.user_id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    checked={selectedUserIds.has(user.user_id)}
                    onCheckedChange={(checked) => handleSelectUser(user.user_id, !!checked)}
                  />
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profile_image || undefined} />
                    <AvatarFallback>
                      {user.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {user.name || 'Unnamed User'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Color</div>
                    <ColorChip color={effectiveColor} showLabel={true} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Intent</div>
                    <span className={`text-xs ${INTENT_CONFIG[user.intent || 'none'].color}`}>
                      {INTENT_CONFIG[user.intent || 'none'].label}
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

        {/* Desktop: Table */}
        <div className="hidden md:block">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Checkbox
                      checked={users?.length ? selectedUserIds.size === users.length : false}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-help">User</span></TooltipTrigger>
                      <TooltipContent className="text-xs">Name and email. Click "View Details" to open the full signal profile drawer.</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-help">Segment</span></TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">Engagement segment calculated by the scoring engine (color_auto), or admin-overridden (color_admin). Purple=Advocate, Green=Engaged, Orange=Underused, Red=Drifting.</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-help">Certified</span></TooltipTrigger>
                      <TooltipContent className="text-xs">Whether this user has passed the Lansa certification exam (lansa_certified = true).</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-help">Intent</span></TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">Admin-assigned journey stage for this user. Set manually to track where the user is in their Lansa journey (e.g. Exploring, Building, Ready).</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild><span className="cursor-help">Last Active</span></TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">Date of the user's last tracked action (user_actions insert or chat message). Updated automatically by DB triggers. Blank = never tracked.</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => {
                  const effectiveColor = getEffectiveColor(user.color_admin, user.color_auto);
                  return (
                    <tr key={user.user_id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedUserIds.has(user.user_id)}
                          onCheckedChange={(checked) => handleSelectUser(user.user_id, !!checked)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile_image || undefined} />
                            <AvatarFallback>
                              {user.name?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.name || 'Unnamed User'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <ColorChip color={effectiveColor} showLabel={true} />
                          {user.color_admin && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground cursor-help">(override)</span>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">Admin-set override. Auto-scoring will not change this until the override is cleared.</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${
                          user.certified ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {user.certified ? 'Yes' : 'No'}
                        </span>
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
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
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
        </div>

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedUserIds.size}
          onClearSelection={() => setSelectedUserIds(new Set())}
          onExportSelected={handleExportSelected}
          onAssignColor={handleAssignColor}
          onAssignIntent={handleAssignIntent}
          onDeleteSelected={handleDeleteSelected}
        />

        {/* User Details Drawer */}
        {selectedUserId && (
          <UserDrawer
            userId={selectedUserId}
            open={!!selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onUpdate={refetch}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedUserIds.size} user(s)? This action cannot be undone and will permanently remove all user data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Delete Users
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
