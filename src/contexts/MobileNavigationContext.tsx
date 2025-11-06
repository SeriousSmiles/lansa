import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';
import { useUserState } from './UserStateProvider';
import { checkAdminRole } from '@/utils/roleHelpers';

interface MobileNavigationContextType {
  shouldShowNavigation: boolean;
  showFAB: boolean;
  fabAction: () => void;
  setFabAction: (action: () => void) => void;
  isAdminView: boolean;
}

const MobileNavigationContext = createContext<MobileNavigationContextType | undefined>(undefined);

export const useMobileNavigation = () => {
  const context = useContext(MobileNavigationContext);
  if (!context) {
    throw new Error('useMobileNavigation must be used within a MobileNavigationProvider');
  }
  return context;
};

const AUTH_ROUTES = ['/auth', '/'];
const ONBOARDING_ROUTES = ['/onboarding', '/profile-starter'];

interface MobileNavigationProviderProps {
  children: React.ReactNode;
}

export const MobileNavigationProvider: React.FC<MobileNavigationProviderProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { userType, loading: userStateLoading } = useUserState();
  const location = useLocation();
  const [fabAction, setFabAction] = useState<() => void>(() => () => {});
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (user?.id) {
        const adminStatus = await checkAdminRole(user.id);
        setIsAdmin(!!adminStatus);
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user?.id]);

  // Determine if we're in admin view
  const isAdminView = location.pathname.startsWith('/admin');
  
  // For job seekers: show their navigation
  // For admin users in admin section: navigation handled by AdminMobileBottomNavigation
  // For employer users: they have their own navigation system
  const shouldShowNavigation = !loading && 
    !userStateLoading &&
    user && 
    userType === 'job_seeker' &&  // CRITICAL: Only show for job seekers
    !isAdminView &&  // Don't show job seeker nav in admin section
    !AUTH_ROUTES.includes(location.pathname) &&
    !ONBOARDING_ROUTES.includes(location.pathname) &&
    !location.pathname.startsWith('/profile/share/');
    
  const showFAB = shouldShowNavigation;

  const value = {
    shouldShowNavigation,
    showFAB,
    fabAction,
    setFabAction,
    isAdminView
  };

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  );
};