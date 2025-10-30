/**
 * Notification Item Component
 * Individual notification display
 */

import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { X, UserPlus, CheckCircle, XCircle, Briefcase, MessageCircle, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/services/notificationService';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
}

const iconMap = {
  org_request_received: UserPlus,
  org_request_approved: CheckCircle,
  org_request_rejected: XCircle,
  org_invitation_received: Users,
  org_member_joined: Users,
  org_role_changed: Shield,
  job_application_received: Briefcase,
  job_application_status_changed: Briefcase,
  match_created: MessageCircle,
  message_received: MessageCircle,
  system_update: CheckCircle,
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const Icon = iconMap[notification.type] || CheckCircle;
  const isUnread = !notification.read_at;

  const handleClick = async () => {
    if (isUnread) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  return (
    <div
      className={cn(
        'px-4 py-3.5 hover:bg-muted/40 cursor-pointer transition-all duration-150 relative group',
        isUnread && 'bg-[hsl(var(--lansa-orange)/0.03)]'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3 items-start">
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
          isUnread 
            ? 'bg-[hsl(var(--lansa-orange)/0.1)] text-[hsl(var(--lansa-orange))]' 
            : 'bg-muted/50 text-muted-foreground'
        )}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <p className={cn(
              'text-sm leading-snug',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'
            )}>
              {notification.title}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--lansa-orange))]" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80 -mr-1"
                onClick={handleDelete}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/60 font-medium">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
