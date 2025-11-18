import { useState, useCallback, useEffect } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';

export function useCandidateNavigation(initialProfiles: DiscoveryProfile[]) {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentProfile = profiles[currentIndex];
  const hasNext = currentIndex < profiles.length - 1;
  const hasPrevious = currentIndex > 0;

  useEffect(() => {
    setProfiles(initialProfiles);
    setCurrentIndex(0);
  }, [initialProfiles]);

  const goToNext = useCallback(() => {
    if (isAnimating || !hasNext) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 500); // Match animation duration
  }, [isAnimating, hasNext]);

  const goToPrevious = useCallback(() => {
    if (isAnimating || !hasPrevious) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, hasPrevious]);

  const removeCurrentProfile = useCallback(() => {
    setProfiles(prev => prev.filter((_, idx) => idx !== currentIndex));
    if (currentIndex >= profiles.length - 1) {
      setCurrentIndex(Math.max(0, profiles.length - 2));
    }
  }, [currentIndex, profiles.length]);

  return {
    currentProfile,
    currentIndex,
    totalProfiles: profiles.length,
    hasNext,
    hasPrevious,
    isAnimating,
    goToNext,
    goToPrevious,
    removeCurrentProfile,
    setIsAnimating
  };
}
