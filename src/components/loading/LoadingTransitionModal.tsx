
import * as React from "react";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoadingProgress } from "./LoadingProgress";
import { LoadingSpinner } from "./LoadingSpinner";
import { useLoadingStatus } from "@/hooks/useLoadingStatus";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface LoadingTransitionModalProps {
  isOpen: boolean;
  isRefreshing?: boolean;
  onComplete?: () => void;
}

export const LoadingTransitionModal = ({ 
  isOpen, 
  isRefreshing = false, 
  onComplete 
}: LoadingTransitionModalProps) => {
  const { currentStatusIndex, progress, loadingStatuses } = useLoadingStatus(isOpen, isRefreshing);
  
  // When progress reaches 100%, trigger the onComplete callback
  useEffect(() => {
    if (progress === 100 && onComplete) {
      const timer = setTimeout(() => {
        console.log("Loading complete, calling onComplete callback");
        onComplete();
      }, 500); // Small delay after reaching 100% to ensure animation completes
      
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent className="sm:max-w-md">
        {/* Add DialogTitle for accessibility */}
        <VisuallyHidden>
          <DialogTitle>Loading Progress</DialogTitle>
        </VisuallyHidden>
        
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <LoadingSpinner />
          
          <h3 className="text-xl font-medium text-center">
            {loadingStatuses[currentStatusIndex]}
          </h3>
          
          <LoadingProgress progress={progress} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
