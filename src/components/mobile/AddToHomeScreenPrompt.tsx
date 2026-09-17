import React, { useState, useEffect } from 'react';
import { X, Plus, Share, Home } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const AddToHomeScreenPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user has already dismissed this prompt
    const dismissed = localStorage.getItem('addToHomeScreenDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after 3 seconds on mobile
    if (isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('addToHomeScreenDismissed', 'true');
  };

  const handleAddToHomeScreen = () => {
    setIsVisible(false);
    // The actual PWA install prompt will be handled by the browser
  };

  // Prompt disabled on mobile per product decision
  return null;
};