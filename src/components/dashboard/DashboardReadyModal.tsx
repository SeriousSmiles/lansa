
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DashboardReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardReadyModal({ isOpen, onClose }: DashboardReadyModalProps) {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const handleGoToDashboard = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-xl bg-white backdrop-blur-xl rounded-2xl">
        <div className="h-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"></div>
        
        <div className="p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1A1F2C]">
              Your Dashboard is Ready!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <p className="text-[#8E9196] text-lg">
              We've built your personalized dashboard based on your profile information.
              You're all set to begin your professional clarity journey.
            </p>
            
            <div className="bg-[#F1F0FB] p-6 rounded-lg border-l-4 border-[#8B5CF6] shadow-sm">
              <p className="text-[#1A1F2C] font-medium">
                Your personalized dashboard contains tailored insights and action steps
                designed specifically for your professional goals.
              </p>
            </div>
            
            <div className="pt-4">
              <Button
                onClick={handleGoToDashboard}
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 text-white py-6 px-8 h-auto rounded-lg border-0 shadow-md"
                disabled={isTransitioning}
              >
                {isTransitioning ? 'Loading...' : 'Go to Dashboard'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
