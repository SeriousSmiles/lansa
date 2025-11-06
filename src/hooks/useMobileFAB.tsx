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

  const openQuickActions = () => {
    setIsQuickActionsOpen(true);
  };

  const closeQuickActions = () => {
    setIsQuickActionsOpen(false);
  };

  const toggleQuickActions = () => {
    setIsQuickActionsOpen(prev => !prev);
  };

  return {
    isQuickActionsOpen,
    openQuickActions,
    closeQuickActions,
    toggleQuickActions
  };
}
