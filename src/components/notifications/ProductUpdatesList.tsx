/**
 * Product Updates List Component
 * Displays "What's New" product updates
 */

import { useEffect, useState } from 'react';
import { productUpdatesService, type ProductUpdate } from '@/services/productUpdatesService';
import { ProductUpdateItem } from './ProductUpdateItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CheckCheck, Sparkles } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

export function ProductUpdatesList() {
  const [updates, setUpdates] = useState<ProductUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshCounts } = useNotifications();

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      setIsLoading(true);
      const data = await productUpdatesService.getRecentUpdates(10);
      setUpdates(data);
    } catch (error) {
      console.error('Error loading product updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      await productUpdatesService.markAllUpdatesAsSeen();
      await refreshCounts();
      toast.success('Marked all updates as seen');
    } catch (error) {
      console.error('Error marking updates as seen:', error);
      toast.error('Failed to mark updates as seen');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading updates...</div>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Sparkles className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm">No updates yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScrollArea className="max-h-[400px]">
        <div className="divide-y">
          {updates.map((update) => (
            <ProductUpdateItem key={update.id} update={update} />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllSeen}
          className="text-xs w-full"
        >
          <CheckCheck className="h-3 w-3 mr-1" />
          Mark all as seen
        </Button>
      </div>
    </div>
  );
}
