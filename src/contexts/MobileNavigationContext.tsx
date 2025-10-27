import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';
import { useUserState } from './UserStateProvider';

interface MobileNavigationContextType {
  shouldShowNavigation: boolean;
  showFAB: boolean;
  fabAction: () => void;
  setFabAction: (action: () => void) => void;
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
  
  // Hide mobile navigation for employer users - they have their own navigation
  const shouldShowNavigation = !loading && 
    !userStateLoading &&
    user && 
    userType === 'job_seeker' &&  // CRITICAL: Only show for job seekers
    !AUTH_ROUTES.includes(location.pathname) &&
    !ONBOARDING_ROUTES.includes(location.pathname) &&
    !location.pathname.startsWith('/profile/share/');
    
  const showFAB = shouldShowNavigation;

  const value = {
    shouldShowNavigation,
    showFAB,
    fabAction,
    setFabAction
  };

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  );
};