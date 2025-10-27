import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedCandidateCard } from "@/components/mobile/employer/EnhancedCandidateCard";
import { DiscoveryProfile } from "@/services/discoveryService";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DiscoveryProfile | null;
  isLoading?: boolean;
  applicantName?: string;
}

export function ApplicantProfileModal({ 
  isOpen, 
  onClose, 
  profile, 
  isLoading = false,
  applicantName 
}: ApplicantProfileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {applicantName ? `${applicantName}'s Profile` : 'Applicant Profile'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : profile ? (
            <EnhancedCandidateCard profile={profile} className="h-full border-0" />
          ) : (
            <div className="flex items-center justify-center h-full text-center p-6">
              <p className="text-muted-foreground">
                Unable to load applicant profile
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
