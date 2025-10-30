/**
 * Notifications Page
 * Full page view of all notifications
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { notificationService, type Notification } from '@/services/notificationService';
import { productUpdatesService, type ProductUpdate } from '@/services/productUpdatesService';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { ProductUpdateItem } from '@/components/notifications/ProductUpdateItem';
import { useNotifications } from '@/contexts/NotificationContext';
import { CheckCheck, Inbox, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const { user } = useAuth();
  const { unreadCount, unseenUpdatesCount, refreshCounts } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [updates, setUpdates] = useState<ProductUpdate[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(true);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadUpdates();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoadingNotifs(true);
      const data = await notificationService.getAllNotifications(50);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  const loadUpdates = async () => {
    try {
      setIsLoadingUpdates(true);
      const data = await productUpdatesService.getRecentUpdates(20);
      setUpdates(data);
    } catch (error) {
      console.error('Error loading updates:', error);
      toast.error('Failed to load updates');
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
      await refreshCounts();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      await productUpdatesService.markAllUpdatesAsSeen();
      await refreshCounts();
      toast.success('All updates marked as seen');
    } catch (error) {
      console.error('Error marking updates as seen:', error);
      toast.error('Failed to mark updates as seen');
    }
  };

  return (
    <DashboardLayout
      userName={user?.displayName || user?.email || 'User'}
      email={user?.email || ''}
    >
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inbox" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="inbox" className="relative">
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                  {unreadCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="updates" className="relative">
                  <Sparkles className="h-4 w-4 mr-2" />
                  What's New
                  {unseenUpdatesCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {unseenUpdatesCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inbox" className="mt-6">
                <div className="space-y-4">
                  {unreadCount > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllRead}
                      >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as read
                      </Button>
                    </div>
                  )}
                  
                  {isLoadingNotifs ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Inbox className="h-16 w-16 mb-4 opacity-20" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <div className="space-y-4">
                  {unseenUpdatesCount > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllSeen}
                      >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as seen
                      </Button>
                    </div>
                  )}
                  
                  {isLoadingUpdates ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading updates...
                    </div>
                  ) : updates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Sparkles className="h-16 w-16 mb-4 opacity-20" />
                      <p>No updates yet</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-2">
                        {updates.map((update) => (
                          <ProductUpdateItem key={update.id} update={update} />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
