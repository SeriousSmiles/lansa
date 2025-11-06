import { ReactNode } from 'react';
import { AdminMobileHeader } from './AdminMobileHeader';
import { AdminMobileBottomNavigation } from './AdminMobileBottomNavigation';
import { AdminMobileActionSheet } from './AdminMobileActionSheet';
import { useMobileFAB } from '@/hooks/useMobileFAB';

interface AdminMobileLayoutProps {
  children: ReactNode;
}

export function AdminMobileLayout({ children }: AdminMobileLayoutProps) {
  const { isQuickActionsOpen, closeQuickActions } = useMobileFAB();

  return (
    <div className="min-h-screen bg-background md:hidden">
      <AdminMobileHeader />
      <main className="pt-14 pb-20 px-4">
        {children}
      </main>
      <AdminMobileBottomNavigation />
      <AdminMobileActionSheet 
        isOpen={isQuickActionsOpen}
        onClose={closeQuickActions}
      />
    </div>
  );
}
