import { useState, useCallback, useEffect } from 'react';
import { DiscoveryProfile } from '@/services/discoveryService';

export function useCandidateNavigation(initialProfiles: DiscoveryProfile[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentProfile = initialProfiles[currentIndex];
  const hasNext = currentIndex < initialProfiles.length - 1;
  const hasPrevious = currentIndex > 0;

  // Reset index when profiles change (e.g., when new profiles load)
  useEffect(() => {
    // Only reset if current index is out of bounds
    if (currentIndex >= initialProfiles.length && initialProfiles.length > 0) {
      setCurrentIndex(0);
    }
  }, [initialProfiles.length, currentIndex]);

  const goToNext = useCallback(() => {
    if (isAnimating || !hasNext) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, hasNext]);

  const goToPrevious = useCallback(() => {
    if (isAnimating || !hasPrevious) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, hasPrevious]);

  const advanceToNext = useCallback(() => {
    setCurrentIndex(prev => {
      return prev + 1;
    });
  }, [initialProfiles.length]);

  return {
    currentProfile,
    currentIndex,
    totalProfiles: initialProfiles.length,
    hasNext,
    hasPrevious,
    isAnimating,
    goToNext,
    goToPrevious,
    advanceToNext,
    setIsAnimating
  };
}
