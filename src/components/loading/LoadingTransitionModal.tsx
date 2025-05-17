
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface LoadingTransitionModalProps {
  isOpen: boolean;
}

const loadingStatuses = [
  "Setting up your personalized dashboard...",
  "Organizing your profile data...",
  "Configuring your recommended actions...",
  "Finalizing your professional clarity insights..."
];

export const LoadingTransitionModal = ({ isOpen }: LoadingTransitionModalProps) => {
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

  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent className="sm:max-w-md" showClose={false}>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="w-16 h-16 border-4 border-[#FF6B4A] border-solid rounded-full border-t-transparent animate-spin"></div>
          
          <h3 className="text-xl font-medium text-center">
            {loadingStatuses[currentStatusIndex]}
          </h3>
          
          <div className="w-full space-y-2">
            <Progress 
              value={progress} 
              className="h-2 bg-gray-200"
              indicatorClassName="bg-[#FF6B4A]"
            />
            <p className="text-sm text-gray-500 text-right">{Math.round(progress)}%</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
