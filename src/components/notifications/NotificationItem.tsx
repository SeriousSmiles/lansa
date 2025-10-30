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
        'p-4 hover:bg-accent/50 cursor-pointer transition-colors relative group',
        isUnread && 'bg-accent/20'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUnread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm font-medium', isUnread && 'text-foreground')}>
              {notification.title}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {isUnread && (
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
        )}
      </div>
    </div>
  );
}
