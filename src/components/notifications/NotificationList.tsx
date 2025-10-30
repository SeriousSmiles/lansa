/**
 * Notification List Component
 * Displays list of notifications in dropdown
 */

import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { CheckCheck, Inbox } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

export function NotificationList() {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-muted-foreground">
        <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Inbox className="h-7 w-7 opacity-40" />
        </div>
        <p className="text-sm font-medium">No notifications</p>
        <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScrollArea className="max-h-[min(70vh,500px)]">
        <div className="divide-y divide-border/50">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-border/50 px-3 py-2.5 flex items-center justify-between bg-muted/20 backdrop-blur-sm">
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs h-8 hover:bg-background/80"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Mark all read
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/notifications')}
          className="text-xs h-8 ml-auto hover:bg-background/80"
        >
          View all
        </Button>
      </div>
    </div>
  );
}
