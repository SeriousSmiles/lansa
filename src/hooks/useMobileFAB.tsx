import { useEffect } from 'react';
import { useMobileNavigation } from '@/contexts/MobileNavigationContext';

export function useMobileFAB() {
  const { setFabAction, setIsHelpModalOpen } = useMobileNavigation();

  useEffect(() => {
    setFabAction(() => () => {
      setIsHelpModalOpen(true);
    });
  }, [setFabAction, setIsHelpModalOpen]);

  return {};
}