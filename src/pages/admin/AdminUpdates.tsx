import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2, RefreshCw, Bell, BellOff } from 'lucide-react';
import { adminProductUpdatesService } from '@/services/adminProductUpdatesService';
import { ProductUpdate } from '@/services/productUpdatesService';
import { UpdateFormDialog } from '@/components/admin/updates/UpdateFormDialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { supabase } from '@/integrations/supabase/client';
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
import { AVAILABLE_ICONS } from '@/components/admin/updates/IconPicker';

const categoryConfig = {
  feature: { label: 'New Feature', color: 'bg-blue-500' },
  improvement: { label: 'Improvement', color: 'bg-green-500' },
  bugfix: { label: 'Bug Fix', color: 'bg-yellow-500' },
  announcement: { label: 'Announcement', color: 'bg-purple-500' },
};

export default function AdminUpdates() {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<ProductUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProductUpdate | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notifyConfirm, setNotifyConfirm] = useState<ProductUpdate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const loadUpdates = async () => {
    setIsLoading(true);
    try {
      const data = await adminProductUpdatesService.getAllUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Error loading updates:', error);
      toast({
        title: 'Error loading updates',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const handleCreate = () => {
    setEditingUpdate(undefined);
    setShowFormDialog(true);
  };

  const handleEdit = (update: ProductUpdate) => {
    setEditingUpdate(update);
    setShowFormDialog(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await adminProductUpdatesService.deleteUpdate(id);
      toast({ title: 'Update deleted successfully' });
      await loadUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
      toast({
        title: 'Error deleting update',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleNotifyUsers = async (update: ProductUpdate) => {
    setNotifyConfirm(null);
    setNotifyingId(update.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('send-product-update-email', {
        body: { update_id: update.id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      toast({
        title: 'Notification sent!',
        description: `${data.sent} users notified about "${update.title}". ${data.failed > 0 ? `${data.failed} failed.` : ''}`,
      });
    } catch (err: any) {
      console.error('[notify-users]', err);
      toast({
        title: 'Failed to send notifications',
        description: err.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setNotifyingId(null);
    }
  };

  const handleFormSuccess = async () => {
    await loadUpdates();
  };

  const { containerRef, isRefreshing: isPulling } = usePullToRefresh({
    onRefresh: loadUpdates
  });

  return (
    <div ref={containerRef}>
      {isPulling && (
        <div className="text-center py-2 md:hidden">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
        </div>
      )}
      
      <div className="flex justify-end mb-4 md:mb-6">
        <Button onClick={handleCreate} size="sm" className="md:size-default">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create Update</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No product updates yet</p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Update
          </Button>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {updates.map((update) => {
            const config = categoryConfig[update.category as keyof typeof categoryConfig] || { label: update.category, color: 'bg-gray-500' };
            const IconComponent = update.icon_name && AVAILABLE_ICONS[update.icon_name as keyof typeof AVAILABLE_ICONS]
              ? AVAILABLE_ICONS[update.icon_name as keyof typeof AVAILABLE_ICONS].icon
              : null;
            const isPast = new Date(update.published_at) <= new Date();
            const isNotifying = notifyingId === update.id;

            return (
              <div key={update.id} className="border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2 md:gap-4">
                  <div className="flex gap-2 md:gap-3 flex-1 min-w-0">
                    {IconComponent && (
                      <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full ${config.color} flex items-center justify-center text-white`}>
                        <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start flex-wrap gap-1 md:gap-2 mb-1">
                        <h3 className="font-semibold text-sm md:text-base">{update.title}</h3>
                        <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                        {update.version && <Badge variant="outline" className="text-xs">v{update.version}</Badge>}
                        <Badge variant={isPast ? 'default' : 'secondary'} className="text-xs">
                          {isPast ? 'Published' : 'Scheduled'}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">{update.description}</p>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs text-muted-foreground">
                        <span>
                          {isPast
                            ? `Published ${formatDistanceToNow(new Date(update.published_at), { addSuffix: true })}`
                            : `Scheduled for ${new Date(update.published_at).toLocaleDateString()}`}
                        </span>
                        {update.link_url && (
                          <a
                            href={update.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-1 md:gap-2 shrink-0">
                    {/* Notify Users button — only for published updates */}
                    {isPast && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNotifyConfirm(update)}
                        disabled={isNotifying}
                        title="Email all users about this update"
                        className="gap-1.5 text-xs"
                      >
                        {isNotifying ? (
                          <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        ) : (
                          <Bell className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                        <span className="hidden md:inline">Notify</span>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(update)}>
                      <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(update.id)}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
                {update.image_url && (
                  <img src={update.image_url} alt={update.title} className="mt-2 md:mt-3 rounded-md max-h-32 md:max-h-48 w-full object-cover" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <UpdateFormDialog
        open={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        onSuccess={handleFormSuccess}
        update={editingUpdate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this update? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notify Users Confirmation */}
      <AlertDialog open={!!notifyConfirm} onOpenChange={() => setNotifyConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notify All Users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will send an email notification about <strong>"{notifyConfirm?.title}"</strong> to all users with a Lansa account.
              <br /><br />
              This action cannot be undone. Make sure this update is ready to share before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => notifyConfirm && handleNotifyUsers(notifyConfirm)}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Send Notification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
