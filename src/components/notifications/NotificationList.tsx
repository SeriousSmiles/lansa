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
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Inbox className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScrollArea className="max-h-[400px]">
        <div className="divide-y">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-2 flex items-center justify-between bg-muted/50">
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/notifications')}
          className="text-xs ml-auto"
        >
          View all
        </Button>
      </div>
    </div>
  );
}
