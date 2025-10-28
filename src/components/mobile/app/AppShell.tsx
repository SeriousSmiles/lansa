import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUserState } from '@/contexts/UserStateProvider';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
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
  const { userType, loading: userStateLoading, hasCompletedOnboarding } = useUserState();
  const location = useLocation();
  const { isQuickActionsOpen, isSearchOpen } = useUIStore();
  const isMobile = useIsMobile();
  
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);
  const isOnboardingRoute = ONBOARDING_ROUTES.includes(location.pathname);
  const isSharedProfile = location.pathname.startsWith('/profile/share/');
  
  // Landing route disables transforms to preserve sticky on mobile
  const isLanding = location.pathname === "/";
  // Compute userName from auth user displayName
  const userName = user?.displayName;
  
  console.log('AppShell state:', { 
    isMobile, 
    loading, 
    userStateLoading,
    user: !!user, 
    userType,
    hasCompletedOnboarding, 
    isAuthRoute, 
    isOnboardingRoute, 
    isSharedProfile,
    showMobileNavigation: isMobile && !loading && !userStateLoading && user && userType === 'job_seeker' && !isAuthRoute && !isOnboardingRoute && !isSharedProfile 
  });
  
  // CRITICAL: Only show mobile navigation for job seekers
  // Employers have their own navigation in MobileEmployerTabs
  const showMobileNavigation = isMobile && !loading && !userStateLoading && user && userType === 'job_seeker' && !isAuthRoute && !isOnboardingRoute && !isSharedProfile;
  
  // On desktop, just render children without mobile shell
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Safe area top padding */}
      <div className="mobile-safe-top" />

      {/* Main Content */}
      <main 
        className={`
          flex-1 relative
          ${showMobileNavigation ? 'pb-20' : ''}
        `}
        style={{
          minHeight: showMobileNavigation 
            ? 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 80px)' 
            : 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
        }}
      >
        <motion.div
          key={location.pathname}
          initial={isLanding ? { opacity: 0 } : { opacity: 0, x: 20 }}
          animate={isLanding ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={isLanding ? { opacity: 0 } : { opacity: 0, x: -20 }}
          transition={isLanding 
            ? { duration: 0.25, ease: "easeOut" }
            : { type: "spring", stiffness: 400, damping: 30, duration: 0.3 }
          }
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
        userName={userName}
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