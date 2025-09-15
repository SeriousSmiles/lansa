import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

interface MobileNavigationContextType {
  shouldShowNavigation: boolean;
  showFAB: boolean;
  fabAction: () => void;
  setFabAction: (action: () => void) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
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
  const location = useLocation();
  const [fabAction, setFabAction] = useState<() => void>(() => () => {});
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const shouldShowNavigation = !loading && 
    user && 
    !AUTH_ROUTES.includes(location.pathname) &&
    !ONBOARDING_ROUTES.includes(location.pathname) &&
    !location.pathname.startsWith('/profile/share/');
    
  const showFAB = shouldShowNavigation;

  const value = {
    shouldShowNavigation,
    showFAB,
    fabAction,
    setFabAction,
    isHelpModalOpen,
    setIsHelpModalOpen
  };

  return (
    <MobileNavigationContext.Provider value={value}>
      {children}
    </MobileNavigationContext.Provider>
  );
};