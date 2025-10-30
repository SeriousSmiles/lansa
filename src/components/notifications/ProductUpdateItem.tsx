/**
 * Product Update Item Component
 * Individual product update display
 */

import { formatDistanceToNow } from 'date-fns';
import { Sparkles, Bug, Rocket, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { productUpdatesService, type ProductUpdate } from '@/services/productUpdatesService';
import { useNotifications } from '@/contexts/NotificationContext';

interface ProductUpdateItemProps {
  update: ProductUpdate;
}

const categoryConfig = {
  feature: { icon: Rocket, label: 'New Feature', color: 'bg-blue-500' },
  improvement: { icon: Sparkles, label: 'Improvement', color: 'bg-green-500' },
  bugfix: { icon: Bug, label: 'Bug Fix', color: 'bg-yellow-500' },
  announcement: { icon: Megaphone, label: 'Announcement', color: 'bg-purple-500' },
};

export function ProductUpdateItem({ update }: ProductUpdateItemProps) {
  const { refreshCounts } = useNotifications();
  const config = categoryConfig[update.category];
  const Icon = config.icon;

  const handleClick = async () => {
    await productUpdatesService.markUpdateAsSeen(update.id);
    await refreshCounts();
    if (update.link_url) {
      window.open(update.link_url, '_blank');
    }
  };

  return (
    <div
      className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium">{update.title}</p>
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {update.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {update.version && (
              <Badge variant="outline" className="text-xs">
                v{update.version}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(update.published_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
