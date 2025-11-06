import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { AdminMobileLayout } from './mobile/AdminMobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';

export function AdminLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <AdminMobileLayout>
        <Outlet />
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
      </div>
    </SidebarProvider>
  );
}
