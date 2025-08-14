import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SwipeCard } from "@/components/discovery/SwipeCard";
import { DiscoveryProfile } from "@/services/discoveryService";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DiscoveryProfile | null;
}

export function ProfilePreviewModal({ isOpen, onClose, profile }: ProfilePreviewModalProps) {
  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How You Appear in Discovery</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-[500px] mx-auto">
          <SwipeCard
            profile={profile}
            onSwipe={() => {}} // No-op for preview
            isActive={false} // Disable interactions
            zIndex={1}
          />
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          This is how other users will see your profile in the discovery interface.
        </div>
      </DialogContent>
    </Dialog>
  );
}