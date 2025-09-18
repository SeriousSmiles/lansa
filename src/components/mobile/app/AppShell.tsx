import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { QuickActionsSheet } from './QuickActionsSheet';
import { SearchOverlay } from './SearchOverlay';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppShellProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = ['/auth', '/', '/help', '/privacy', '/terms'];
const ONBOARDING_ROUTES = ['/onboarding', '/profile-starter'];

export function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { isQuickActionsOpen, isSearchOpen } = useUIStore();
  const isMobile = useIsMobile();
  
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);
  const isOnboardingRoute = ONBOARDING_ROUTES.includes(location.pathname);
  const isSharedProfile = location.pathname.startsWith('/profile/share/');
  
  const showMobileNavigation = isMobile && !loading && user && !isAuthRoute && !isOnboardingRoute && !isSharedProfile;
  
  // On desktop, just render children without mobile shell
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Safe area top padding */}
      <div className="mobile-safe-top" />
      
      {/* Top Bar */}
      <AnimatePresence>
        {showMobileNavigation && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <TopBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={`
          flex-1 relative
          ${showMobileNavigation ? 'pb-20' : ''}
        `}
        style={{
          minHeight: showMobileNavigation 
            ? 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 64px - 80px)' 
            : 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            duration: 0.3 
          }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {showMobileNavigation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              delay: 0.1 
            }}
          >
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Sheet */}
      <QuickActionsSheet 
        isOpen={isQuickActionsOpen}
        onClose={() => useUIStore.getState().setQuickActionsOpen(false)}
      />

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => useUIStore.getState().setSearchOpen(false)}
      />

      {/* Safe area bottom padding */}
      <div className="mobile-safe-bottom" />
    </div>
  );
}