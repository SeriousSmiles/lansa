import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AIOnboardingFlow } from "@/components/onboarding/AIOnboardingFlow";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AICareerPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function AICareerPlanModal({ isOpen, onClose, onComplete }: AICareerPlanModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-full w-full h-full max-h-full p-0 m-0 rounded-none border-0 overflow-y-auto sm:max-w-full sm:h-screen sm:max-h-screen">
        {/* Close button overlay */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 bg-background/80 backdrop-blur-sm rounded-full shadow-md"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <AIOnboardingFlow
          onComplete={onComplete}
          modalMode
        />
      </DialogContent>
    </Dialog>
  );
}
