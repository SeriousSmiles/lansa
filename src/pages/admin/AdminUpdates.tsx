import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { adminProductUpdatesService } from '@/services/adminProductUpdatesService';
import { ProductUpdate } from '@/services/productUpdatesService';
import { UpdateFormDialog } from '@/components/admin/updates/UpdateFormDialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
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
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleFormSuccess = async () => {
    await loadUpdates();
  };

  return (
    <>
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
            const config = categoryConfig[update.category];
            const IconComponent = update.icon_name && AVAILABLE_ICONS[update.icon_name as keyof typeof AVAILABLE_ICONS]
              ? AVAILABLE_ICONS[update.icon_name as keyof typeof AVAILABLE_ICONS].icon
              : null;
            const isPast = new Date(update.published_at) <= new Date();

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
                  <div className="flex flex-col md:flex-row gap-1 md:gap-2">
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
    </>
  );
}
