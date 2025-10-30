/**
 * Notification Bell Component
 * Shows notification icon with badge count and dropdown
 */

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from './NotificationList';
import { ProductUpdatesList } from './ProductUpdatesList';

export function NotificationBell() {
  const { totalCount, unreadCount, unseenUpdatesCount } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[420px] max-w-[calc(100vw-2rem)] p-0 shadow-lg">
        <Tabs defaultValue="inbox" className="w-full">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 pt-3 pb-2">
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            </div>
            <TabsList className="w-full grid grid-cols-2 bg-transparent px-2 pb-2">
              <TabsTrigger 
                value="inbox" 
                className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <span className="text-sm">Inbox</span>
                {unreadCount > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[hsl(var(--lansa-orange))] px-1.5 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="updates" 
                className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <span className="text-sm">What's New</span>
                {unseenUpdatesCount > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[hsl(var(--lansa-blue))] px-1.5 text-[10px] font-semibold text-white">
                    {unseenUpdatesCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="inbox" className="m-0">
            <NotificationList />
          </TabsContent>
          <TabsContent value="updates" className="m-0">
            <ProductUpdatesList />
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
