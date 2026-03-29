import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { AdminMobileLayout } from './mobile/AdminMobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShareLansaMenu } from '@/components/ShareLansaMenu';

export function AdminLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <AdminMobileLayout>
        <Outlet />
        <div className="fixed bottom-20 right-4 z-50">
          <ShareLansaMenu className="shadow-lg rounded-full px-4 py-2.5 bg-card border-border/50 hover:bg-accent font-urbanist text-sm" />
        </div>
      </AdminMobileLayout>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopBar title="Admin" actions={undefined} />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
        <div className="fixed bottom-6 right-6 z-50">
          <ShareLansaMenu className="shadow-lg rounded-full px-5 py-3 bg-card border-border/50 hover:bg-accent font-urbanist" />
        </div>
      </div>
    </SidebarProvider>
  );
}
