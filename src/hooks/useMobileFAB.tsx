import { useState, useEffect } from 'react';
import { useMobileNavigation } from '@/contexts/MobileNavigationContext';

export function useMobileFAB() {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { setFabAction } = useMobileNavigation();

  useEffect(() => {
    setFabAction(() => () => {
      setIsQuickActionsOpen(true);
    });
  }, [setFabAction]);

  const closeQuickActions = () => {
    setIsQuickActionsOpen(false);
  };

  return {
    isQuickActionsOpen,
    closeQuickActions
  };
}