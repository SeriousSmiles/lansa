
import { useState, useEffect } from "react";

// Updated loading statuses for dashboard preparation
export const loadingStatuses = [
  "Fetching your profile data...",
  "Preparing your dashboard...",
  "Setting up your personalized view..."
];

export const useLoadingStatus = (isOpen: boolean, isRefreshing: boolean = false) => {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setCurrentStatusIndex(0);
      setProgress(0);
      return;
    }

    // Update status message every 2.5 seconds
    const statusInterval = setInterval(() => {
      setCurrentStatusIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex < loadingStatuses.length ? nextIndex : prevIndex;
      });
    }, 2500);

    // Gradually increase progress
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        // Calculate next progress value, ensure we reach 100% in about 7.5 seconds
        const increment = 100 / (loadingStatuses.length * 10);
        let nextProgress = prevProgress + increment;
        
        // If refreshing and progress is high, accelerate to 100%
        if (isRefreshing && nextProgress > 85) {
          nextProgress = Math.min(prevProgress + increment * 2, 100);
        }
        
        // Cap at 100%
        return Math.min(nextProgress, 100);
      });
    }, 300);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, isRefreshing]);

  return {
    currentStatusIndex,
    progress,
    loadingStatuses
  };
};
