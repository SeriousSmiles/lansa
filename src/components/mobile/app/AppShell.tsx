import React, { useMemo } from 'react';
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
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Landing route disables transforms to preserve sticky on mobile
  const isLanding = location.pathname === "/";
  // Compute userName from auth user displayName
  const userName = user?.displayName;
  
  const isActiveThread = /^\/chat\/.+/.test(location.pathname);
  const isFullBleedRoute = isActiveThread;

  // CRITICAL: Only show mobile navigation for job seekers
  // Employers have their own navigation in MobileEmployerTabs
  // Admin routes have their own navigation in AdminMobileLayout
  const showSeekerNav = useMemo(
    () => !loading && !userStateLoading && user && userType === 'job_seeker' && !isAuthRoute && !isOnboardingRoute && !isSharedProfile && !isAdminRoute,
    [loading, userStateLoading, user, userType, isAuthRoute, isOnboardingRoute, isSharedProfile, isAdminRoute]
  );
  
  // On desktop, just render children without mobile shell
  const showMobileNavigation = isMobile && showSeekerNav;
  if (!isMobile) {
    // Tablet widths have no sidebar rail (it starts at lg), so seekers keep the thumb tabs there.
    return (
      <>
        {children}
        {showSeekerNav && !isActiveThread && (
          <div className="lg:hidden">
            <div className="sk-nav-spacer" aria-hidden />
            <BottomNav />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      {/* Safe area top padding */}
      <div className="mobile-safe-top" />

      {/* Main Content */}
      <main 
        className={`
          flex-1 relative
          ${showMobileNavigation && !isFullBleedRoute ? 'sk-nav-pad' : ''}
        `}
        style={{
          minHeight: showMobileNavigation && !isFullBleedRoute
            ? 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 80px)' 
            : 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
        }}
      >
        <motion.div
          key={location.pathname.split('/').slice(0, 2).join('/')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {showMobileNavigation && <BottomNav />}
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

    </div>
  );
}