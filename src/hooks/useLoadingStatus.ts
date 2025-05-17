
import { useState, useEffect } from "react";

export const loadingStatuses = [
  "Setting up your personalized dashboard...",
  "Organizing your profile data...",
  "Configuring your recommended actions...",
  "Finalizing your professional clarity insights..."
];

export const useLoadingStatus = (isOpen: boolean) => {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setCurrentStatusIndex(0);
      setProgress(0);
      return;
    }

    // Update status message every 3 seconds
    const statusInterval = setInterval(() => {
      setCurrentStatusIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex < loadingStatuses.length ? nextIndex : prevIndex;
      });
    }, 3000);

    // Gradually increase progress
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        // Calculate next progress value
        const increment = 100 / (loadingStatuses.length * 5);
        const nextProgress = Math.min(prevProgress + increment, 100);
        return nextProgress;
      });
    }, 600);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen]);

  return {
    currentStatusIndex,
    progress,
    loadingStatuses
  };
};
